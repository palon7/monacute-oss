import os
from commands import MonacuteCommand
import sys
import commands
import json
import logging

from dotenv import load_dotenv
from google.cloud import pubsub_v1
from google.api_core import retry

load_dotenv()

# Logger
# create logger
logger = logging.getLogger("monacute")

# Settings
PUBSUB_PROJECT_ID = os.getenv('PUBSUB_PROJECT_ID', default='projectname')
PUBSUB_TOPIC = os.getenv('PUBSUB_TOPIC', default='GPUGeneration')
PUBSUB_SUBSCRIPTION = os.getenv(
    'PUBSUB_SUBSCRIPTION', default='GPUGeneration-sub')

MODEL_PATH = os.path.join(os.path.dirname(
    __file__), os.getenv('MODEL_PATH', default='model.pkl'))
USE_REAL_MODEL = os.getenv('USE_REAL_MODEL', 'false') == 'true'


def setup_logger():
    logger.setLevel(logging.DEBUG)
    # create console handler and set level to debug
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)

    # create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s: [%(levelname)s] %(message)s')

    # add formatter to ch
    ch.setFormatter(formatter)
    logger.addHandler(ch)


if USE_REAL_MODEL:
    from character_generator import CharacterGenerater
    logger.info("Using real model")
else:
    from dummy_generator import CharacterGenerater
    logger.info("Using dummy model")



setup_logger()
chara_generator = CharacterGenerater(MODEL_PATH)
command_parser = MonacuteCommand(chara_generator)

NUM_MESSAGES=1

def main():

    logger.info("Initializing monacute gpu-gen")
    subscriber, subscription_path = init_pubsub(
            PUBSUB_PROJECT_ID, PUBSUB_SUBSCRIPTION)
    logger.info("Connected to pubsub. Waiting message...")

    with subscriber:
        while True:
            response = subscriber.pull(
                    request={"subscription": subscription_path, "max_messages": NUM_MESSAGES},
                    retry=retry.Retry(deadline=300), timeout=30,
                    )
            if len(response.received_messages) == 0:
                logger.info("No more message. exit.")
                sys.exit(0)
            ack_ids = []
            for received_message in response.received_messages:
                if pubsub_callback(received_message.message):
                    ack_ids.append(received_message.ack_id)

                subscriber.acknowledge(
                        request={"subscription": subscription_path, "ack_ids": ack_ids}
                        )

                print("Received and acknowledged.")




def init_pubsub(project, subscription):
    subscriber = pubsub_v1.SubscriberClient()
    subscription_path = 'projects/{project_id}/subscriptions/{sub}'.format(
        project_id=project,
        sub=subscription,  # Set this to something appropriate.
    )

    return subscriber, subscription_path


def pubsub_callback(message):
    logger.info(message.data)
    # parse for json
    result = parse_message(message.data)
    # check for command
    return result


def parse_message(message_json):
    message = json.loads(message_json)
    try:
        command = message["command"]
        logger.info("Received command: {}".format(command))

        if command == "generate_gen0_card":
            command_parser.generate_gen0_card(message["monacute_id"])
            return True
        else:
            logger.info("Unknown command: {}".format(command))
    except KeyError as e:
        logger.exception('Failed to parse message json: ' + str(e))
        return False


if __name__ == "__main__":
    main()
