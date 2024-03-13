import sqlite3
import os
import csv

cwd = os.getcwd()

DB_URL = os.path.join(cwd,'data','db.sql')
MOCK_DATA = os.path.join(cwd,'data','MOCK_DATA_SHORT.csv')

def get_connection() -> object:
    return sqlite3.connect(DB_URL)

def create_table():
    with get_connection() as connection:
        cursor = connection.cursor()
        cursor.execute("""CREATE TABLE IF NOT EXISTS contacts(id integer PRIMARY KEY AUTOINCREMENT,
                                                              first_name TEXT,
                                                              last_name TEXT,
                                                              email TEXT,
                                                              gender TEXT,
                                                              ip_address TEXT)""")

def populate_mock_data():
    with get_connection() as connection:
        cursor = connection.cursor()
        # first check if the table is empty
        res = cursor.execute("SELECT count(1) from contacts")
        record = res.fetchone()
        if record[0] == 0:
            records=list()
            with open(MOCK_DATA) as source:
                dr = csv.DictReader(source)
                records = [(i['id'], 
                            i['first_name'], 
                            i['last_name'], 
                            i['email'], 
                            i['gender'], 
                            i['ip_address']) for i in dr]
            cursor.executemany("INSERT INTO contacts VALUES (?, ?, ?, ?, ?, ?);", records)


def get_all_data()-> list:
    with get_connection() as connection:
        connection.row_factory = sqlite3.Row #to feturn the records as objects
        cursor = connection.cursor()
        records = cursor.execute("SELECT * from contacts").fetchall()
        resList = []
        for item in records:
            resList.append({k: item[k] for k in item.keys()})
        return resList


def exits(cursor: object, record: dict) -> bool:
    idx = int(record['id'])
    res = cursor.execute("SELECT count(1) from contacts where id = ?",(idx,)).fetchone()
    if res[0] == 0:
        return False
    return True

def upsert(record: dict) -> str:
    with get_connection() as connection:
        cursor = connection.cursor()
        if exits(cursor, record):
            cursor.execute("""update contacts
                              set first_name = :first_name,
                                  last_name  = :last_name,
                                  email      = :email,
                                  gender     = :gender,
                                  ip_address = :ip_address
                               where id = :id
                            """, make_input_record(record))
            connection.commit()
            return "updated"
        #else insert
        cursor.execute("""insert into contacts values
                          (:id, :first_name, :last_name, :email, :gender, :ip_address)""",
                        make_input_record(record))
        connection.commit()
        return "inserted"


def make_input_record(in_record: dict) -> dict:
    return {'id': int(in_record['id']),
            'first_name': in_record['first_name'],
            'last_name': in_record['last_name'],
            'email': in_record['email'],
            'gender': in_record['gender'],
            'ip_address': in_record['ip_address']}


if __name__ == '__main__':
    print("Creating a mock db")
    create_table()
    populate_mock_data()