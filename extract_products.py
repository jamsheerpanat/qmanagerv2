import sqlite3
import uuid
import datetime

# Setup IDs
category_id = 'db0e67ef-d2dc-4616-83ea-cb5907cd3477' # Smart Home Devices
service_type_id = '5581c144-1ccb-4605-aa51-48e06b5593c2' # Smart Home Automation

db_path = '../Documents/My Projects 2025/octonics-quotation-engine/database/database.sqlite'
out_path = 'imported_products.sql'

conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

cursor.execute("SELECT * FROM products")
rows = cursor.fetchall()

sql_statements = []
sql_statements.append("-- Generated SQL for importing products into QManager v2\n")

for row in rows:
    product_id = str(uuid.uuid4())
    name = str(row['name']).replace("'", "''")
    
    # Generate a product code if catalog number is empty
    catalog_number = row['catalog_number']
    if not catalog_number:
        catalog_number = f"PRD-{row['id']}"
    
    product_code = f"PRD-{catalog_number}".replace(" ", "-")[:50]
    # Ensure it doesn't conflict, wait, we might have duplicate catalog numbers. Let's just use PRD-{uuid} or append ID.
    product_code = f"PRD-{row['id']:04d}-{catalog_number}"
    
    brand = row['brand']
    brand_sql = f"'{str(brand).replace(chr(39), chr(39)+chr(39))}'" if brand else "NULL"
    
    model_number = catalog_number
    model_number_sql = f"'{str(model_number).replace(chr(39), chr(39)+chr(39))}'" if model_number else "NULL"
    
    description = row['description']
    desc_sql = f"'{str(description).replace(chr(39), chr(39)+chr(39))}'" if description else "NULL"
    
    unit_price = row['unit_price'] if row['unit_price'] is not None else 0.0
    
    created_at = row['created_at'] if row['created_at'] else datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    updated_at = row['updated_at'] if row['updated_at'] else datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    insert_stmt = f"""
INSERT INTO "Product" (
    "id", "productCode", "productName", "brand", "modelNumber", "shortDescription",
    "categoryId", "serviceTypeId", "unit", "costPrice", "sellingPrice", "minimumSellingPrice",
    "currency", "taxable", "taxRate", "isActive", "createdAt", "updatedAt"
) VALUES (
    '{product_id}', '{product_code}', '{name}', {brand_sql}, {model_number_sql}, {desc_sql},
    '{category_id}', '{service_type_id}', 'pcs', 0, {unit_price}, 0,
    'KWD', true, 0, true, '{created_at}', '{updated_at}'
);
""".strip()
    
    sql_statements.append(insert_stmt)

with open(out_path, 'w') as f:
    f.write("\n".join(sql_statements))

print(f"Generated {len(rows)} product inserts into {out_path}")
