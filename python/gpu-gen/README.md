# Monacute GPU Generation

# Setup

1. `cd python/gpu-gen`
2. `mv .env.example .env`
3. `vim .env`
4. `pip install -r requirements.txt`

# Run

```bash
./start.sh
```

Exits when all Pub/Sub tasks have been completed. Use cron or similar if necessary.
