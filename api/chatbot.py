from cohere_chat import *
from db import *
from translatebot import translate_text

bot_memory=10
co=init_client()

def chat(user_id,chat_id,prompt):

    messages=fetch_chat_history_rts(user_id,chat_id,bot_memory)
    messages.append({"role":"user","content":prompt})
    response_text=fetch_response(co,messages)

    insert_chat(chat_id,user_id, prompt, "user")
    insert_chat(chat_id,user_id, response_text, "bot")

    return response_text

def one_time_chat(prompt):
    messages=[]
    messages.append({"role":"system","content":"you have to assist the user with the pdf text that will be given to you"})
    messages.append({"role":"user","content":prompt})

    response_text=fetch_response(co,messages)

    return response_text

    
if __name__=="__main__":
    # eng_text=read_pdf("hackathon 2/tests/dw.pdf")

    # print(eng_text)

    # id=1
    # resp=chat(id,"summarize this text given below in brief\n"+eng_text)

    # hindiresponse=translate_text(resp,"en","pa")
    # print(hindiresponse)
    # speak(hindiresponse,"pa")
    chat(1,1,"hello")

