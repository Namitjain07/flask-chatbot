import asyncio
from googletrans import Translator

async def translate_main(text, source="en",dest="hi"):
    translator = Translator()
    translated_text = await translator.translate(text, src=source, dest=dest)
    #print(translated_text.text)  # Output: Bonjour, comment ça va ?
    return translated_text.text

def translate_text(text, source="en",dest="hi"):
    return asyncio.run(translate_main(text,source,dest))

#print(translate("hello dad"))
