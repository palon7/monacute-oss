import logging
import db
import numpy as np
import os
import io
import json
import requests
import uuid

from PIL import Image as PILImage
import wand
from wand.image import Image, COMPOSITE_OPERATORS
from wand.color import Color
from wand.drawing import Drawing
from google.cloud import firestore
from google.cloud import storage


class MonacuteCommand:

    def __init__(self, character_generator):
        self.character_generator = character_generator
        self.logger = logging.getLogger("monacute.command")
        self.db = db.Database(os.getenv("DATABASE_URL"))
        self.storage_client = storage.Client()
        self.bucket = self.storage_client.get_bucket(
            os.getenv('STORAGE_BUCKET'))

    def post_pinata(self, path, name, filename):
        metadata = json.dumps(
            {"name": name, "keyvalues": {}}, ensure_ascii=False)
        print(metadata)
        files = {"file": (filename, open(path, 'rb'), "image/png"),
                 "pinataMetadata": ("", metadata, "text/plain; charset=UTF-8")}

        headers = {'Authorization': 'Bearer {}'.format(self.PINATA_JWT_TOKEN)}
        result = requests.post("https://api.pinata.cloud/pinning/pinFileToIPFS", headers=headers,
                               files=files)
        self.logger.debug("Pinata posted: " + str(result.status_code))
        result_json = result.json()
        self.logger.info("Pinata hash:" + result_json["IpfsHash"])
        return result_json["IpfsHash"]

    def post_monacard(self, path):
        files = {"image": (path, open(path, 'rb'), "image/png")}
        result = requests.post("https://card.mona.jp/api/upload_image",
                               files=files)
        self.logger.debug("Monacard posted: " + str(result.status_code))
        result_json = result.json()
        ipfshash = result_json["success"]["cid"]
        self.logger.info("Monacard hash:" + ipfshash)
        return ipfshash

    def generate_gen0_card(self, monacute_id):
        self.logger.info("Generating Gen0 monacard id=%d", monacute_id)
        self.logger.debug("Loading metadata from database...")

        # Get metadata for generation
        card_info = self.db.get_card_info(monacute_id)
        if card_info is None:
            self.logger.error("No card found with id=%d", monacute_id)
            return False

        if card_info["imageCid"] != None:
            self.logger.info("Already image generated. Skip.")
            return False
        self.logger.info("Generating #{number}: {name}".format(
            number=card_info["number"], name=card_info["name"]))

        # Generate image
        self.logger.debug("Generating random image...")
        seed = np.frombuffer(card_info["seed"], dtype=np.uint32)
        image_path = f'/tmp/monacute-upload-image-{card_info["number"]}.png'
        image = self.character_generator.get_random_image(seed)
        image.save(image_path)

        self.logger.debug("Creating card image...")
        # return wand image
        card_image_path = f'/tmp/monacute-upload-card-{card_info["number"]}.png'
        card_image = self.create_card_image(
            card_info["number"], card_info["name"], image)
        card_image.save(filename=card_image_path)

        # upload images to cloud firestore
        dna_url = str(uuid.uuid4())

        self.logger.debug("Uploading images to cloud store...")
        self.logger.debug("DNA UUID: " + dna_url)
        # upload image to cloud storage
        blob = self.bucket.blob(f'{dna_url}_card.png')
        blob.upload_from_filename(filename=card_image_path)
        blob = self.bucket.blob(f'{dna_url}.png')
        blob.upload_from_filename(filename=image_path)

        #self.logger.debug("Uploading images to IPFS...")
        if os.getenv('POST_MONACARD') == 'true':
            card_cid = self.post_monacard(card_image_path)
        else:
            card_cid = "ffffffffffffffffffffffffMONACARD"

        if os.getenv('POST_PINATA') == 'true':
            image_cid = self.post_pinata(
                image_path, card_info["name"], f"monacute_{card_info['number']}.png")
        else:
            image_cid = "ffffffffffffffffffffffffPINATA"

        self.logger.debug("Updating database...")
        self.db.update_status(monacute_id, card_cid, image_cid, dna_url)

        self.logger.debug("Cleanup...")
        os.remove(card_image_path)
        self.logger.info("Completed!")

    def create_card_image(self, number, name, pil_image):
        img = Image(width=560, height=800, background=Color('white'))
        print(len(name))
        num_y = 710
        name_y = 740
        name_size = 48
        if len(name) > 11:
            name = name.replace("・", "・\n　")
            num_y = 695
            name_y = 745
            name_size = 42
        draw = Drawing()
        draw.font = 'asset/rounded-mplus-1c-light.ttf'
        draw.font_size = 32
        draw.fill_color = Color('WHITE')
        draw.text(23, 695, f"#{number}")
        draw.font_size = name_size
        draw.text_interline_spacing = -15
        draw.text(0, 745, f"「{name}」")

        img_card = Image(filename='asset/monacute_base.png')
        img.composite(img_card, 0, 0)

        b = io.BytesIO()
        pil_image.save(b, 'PNG')
        image_bytes = b.getvalue()
        img_girl = Image(blob=image_bytes)
        img_girl.resize(564, 564)
        img.composite(img_girl, 0, 89)

        draw(img)
        return img
