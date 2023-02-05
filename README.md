# monacute

Automatic generated Monaparty NFT.

**TODO: Add better documentation**

# Setup

1. `yarn install`
2. `yarn lerna bootstrap`
3. `yarn lerna run build`
4. `yarn prisma:generate`
5. Setup task (see [README on monacute-task](/apps/monacute-task/README.md))
6. Setup gpu (see [README on gpu-gen](/python/gpu-gen/README.md))

# File structure

- bin/ - useful script
- apps/
  - monacute-task/ - Backend task server (Generate/Publish NFTs, Auction management)
  - ~~monacute-api/ - Web API server~~ (not published yet)
  - ~~monacute-front/ - Frontend app~~ (not published yet)
- packages/
  - monaparty/ - Library for monaparty api
- python/ - python package
  - monacute-gen/ - Image generation, Card image generation, Issue asset

# License

Files in `apps/` are licensed under [AGPLv3](/apps/monacute-task/LICENSE.md).

`python/gpu-gen/asset/rounded-mplus-1c-light.ttf` are licensed under [SIL Open Font License 1.1](https://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL_web) ([Copyright 2021 The M+ FONTS Project Authors](https://github.com/coz-m/MPLUS_FONTS))

Other files are licensed under [MIT License](/python/gpu-gen/LICENSE.md).

# Donation
**Monacoin:** MSEFCyitaSrTKgp4gdGPhMxxY5ZmBx9wbg\
**Ethereum:** 0x911c3bd983AB24Fdf5db97560904803a4e1EAc6f\
**Bitcoin:** 16yKdR2zHe7vVJBBzEJdZDH3Gj7LpSib1S
