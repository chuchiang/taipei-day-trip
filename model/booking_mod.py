from flask import *
from model.mysql_cnx import execute_query

def bookind_db(member_id):
    query = "SELECT booking.member_id,\
    booking.attraction_id,\
    attractions.name,\
    attractions.address,\
    attractions.images,\
    booking.date,\
    booking.time,\
    booking.price,\
    booking.id\
    FROM attractions INNER JOIN booking ON attractions.id = booking.attraction_id WHERE booking.member_id=%s;"
    values = (member_id,)
    data_list = execute_query(query, values)
    return data_list


def booking_build_db(member_id, attractionId, date, time, price):
    booking_query = "INSERT INTO booking(member_id,attraction_id,date,time,price)VALUES(%s,%s,%s,%s,%s);"
    booking_values = (member_id, attractionId, date, time, price)
    return execute_query(booking_query, booking_values)

def booking_delete_db(data,member_id):
    query = "DELETE FROM booking WHERE id=%s and member_id=%s"
    values = (data, member_id)
    execute_query(query, values)

    return execute_query(query, values)