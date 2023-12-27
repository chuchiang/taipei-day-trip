from flask import *
from model.mysql_cnx import execute_query

def user_email_db(signup_email):
    query = "SELECT*FROM members WHERE email=%s"
    values = (signup_email,)
    return execute_query(query, values)

def user_db(signup_name, signup_email, signup_password):
    query = "INSERT INTO members(name,email,password)VALUES(%s,%s,%s);"
    values = (signup_name, signup_email, signup_password)
    return execute_query(query, values)


def signin_db(signin_email, signin_password):
    query = "SELECT*FROM members WHERE email=%s and password=%s"
    values = (signin_email, signin_password)
    return execute_query(query, values)
