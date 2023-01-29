# monacute-task

Backend task for monacute.

## Function

- Trigger creation of NFT card at time
- Check the created NFT and list it to the auction
- Manage auction and send NFT on valid bid
- Refund invalid bids automatically

## Development Setup

### Configuration

```bash
cd apps/monacute-task
cp .env.example .env
vim .env
```

### Start Docker

```bash
cd ../../
docker-compose build
docker-compose up -d
```

### Prepare electrum-mona

Get public key from logs(`docker-compose logs`)

```
monacute-task_1 | wallet_public_key: tpubD6NzVbkrYhZ4XrpPs7JdLiNxSfwn4ZhRVqVz4fxZ4hYeNgpgH5XSochSDE4SDJCveySZ3exjJtkl3dGbqFFYYRA3d4BFyTZwpJX3XLFjSDt
```

Load key into electrum-mona

```bash
docker-compose exec electrum-mona electrum-mona restore tpubD6NzVbkrYhZ4XrpPs7JdLiNxSfwn4ZhRVqVz4fxZ4hYeNgpgH5XSochSDE4SDJCveySZ3exjJtkl3dGbqFFYYRA3d4BFyTZwpJX3XLFjSDt --testnet
docker-compose exec electrum-mona electrum-mona load_wallet --testnet
```

### restart

```bash
docker-compose stop
docker-compose up -d
docker-compose exec electrum-mona electrum-mona load_wallet --testnet
```

# Commands

## Add an auction manually

```bash
docker-compose exec monacute-task yarn run ts-node apps/monacute-task/bin/create_auction.ts \
-t 20211022T000000+0900 -d 24 -p 10 -n 0.1 -a A17999363374503838666
```
