import pytz
from datetime import datetime

kst = pytz.timezone('Asia/Seoul')

def get_current_time():
    return datetime.now(kst)
