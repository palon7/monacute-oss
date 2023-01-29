from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import DictCursor

import os


class Database:
    def __init__(self, dsn: str) -> None:
        self.dsn = dsn

    def get_connection(self):
        return psycopg2.connect(self.dsn)

    def query_dict(self, sql: str, param: tuple):
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=DictCursor) as cur:
                cur.execute(sql, param)
                row = cur.fetchone()
                if row is None:
                    return None
                return dict(row)

    def query(self, sql: str, param: tuple):
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=DictCursor) as cur:
                cur.execute(sql, param)

    def get_card_info(self, card_id):
        row = self.query_dict(
            """SELECT * FROM "Monacute" WHERE id = %s;""", (card_id,))
        return row

    def update_status(self, card_id, card_cid, image_cid, dna_url):
        self.query(
            """UPDATE "Monacute" SET "cardCid" = %s, "imageCid" = %s, "dnaUrl" = %s WHERE id = %s;""",
            (card_cid, image_cid, dna_url, card_id))
