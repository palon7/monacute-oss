import os
import pickle
import numpy as np
import numpy.linalg as la

import PIL.Image
import PIL.ImageSequence

from functools import partial

import logging

from numpy.random import default_rng


class CharacterGenerater:
    def __init__(self, pkl_path):
        self.rng = default_rng()
        self.logger = logging.getLogger("monacute.character_generator")

        self.logger.info("****** USING DUMMY GENERATOR ******")
        # Gs.print_layers()
        # _D.print_layers()

    def get_random_image(self, seed=None):
        # Genereta dummy black image
        image = PIL.Image.new('RGB', (512, 512));
        return image
