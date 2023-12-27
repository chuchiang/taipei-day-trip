from flask import *
from model.mysql_cnx import execute_query


def order_db(member_id, order_number, payment_status, attraction_id,date, time, price, contact_name, contact_phone, contact_email):
    order_query = "INSERT INTO orders(member_id,order_number,payment_status,attraction_id,date,time,price,contact_name,contact_phone,contact_email)VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);"
    order_values = (member_id, order_number, payment_status, attraction_id,date, time, price, contact_name, contact_phone, contact_email)
    return execute_query(order_query, order_values)

def ok_delete_db(member_id):
    cart_query = "DELETE FROM booking WHERE member_id=%s"
    cart_values = (member_id,)
    return execute_query(cart_query, cart_values)

def ok_update_db(order_number):
    event_query = "UPDATE orders SET payment_status=%s  WHERE order_number=%s;"
    event_values = ("付款成功", order_number)
    return execute_query(event_query, event_values)

def false_update_db(order_number):
    event_query = "UPDATE orders SET payment_status=%s  WHERE order_number=%s;"
    event_values = ("付款失敗", order_number)
    return execute_query(event_query, event_values)

def ordernumber_db(oderNumber):
    ordernumber_query='SELECT orders.order_number,\
                orders.price,\
                orders.attraction_id,\
                attractions.name,\
                attractions.address,\
                attractions.images,\
                orders.date,\
                orders.time,\
                orders.contact_name,\
                orders.contact_phone,\
                orders.contact_email\
                FROM attractions INNER JOIN orders ON attractions.id = orders.attraction_id WHERE orders.order_number=%s AND orders.payment_status="付款成功";'
    ordernumber_values=(oderNumber,)
    return execute_query(ordernumber_query, ordernumber_values)

def memberorder_db(member_id):
    query = "SELECT*FROM orders WHERE member_id=%s AND payment_status='付款成功';"
    values = (member_id,)
    return execute_query(query, values)
    