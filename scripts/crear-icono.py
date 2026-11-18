"""Genera los formatos Windows y PNG del icono vectorial de Gestor de Tracks."""
from pathlib import Path
from PIL import Image, ImageDraw
root = Path(__file__).resolve().parent.parent
scale = 4
image = Image.new('RGBA', (512 * scale, 512 * scale), (0, 0, 0, 0))
draw = ImageDraw.Draw(image)
def rect(box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(tuple(round(n*scale) for n in box), radius=radius*scale, fill=fill, outline=outline, width=width*scale)
rect((16,16,496,496),112,'#121212','#383838',8)
for x in (136,244,352): rect((x,112,x+24,400),12,'#454545')
for x,y in ((104,188),(212,296),(320,148)):
    rect((x,y,x+88,y+56),16,'#ff4500')
    rect((x+24,y+24,x+64,y+32),4,'#fff3e5')
image = image.resize((512,512), Image.Resampling.LANCZOS)
image.save(root/'public/icon.png')
image.save(root/'public/icon.ico', sizes=[(n,n) for n in (16,24,32,48,64,128,256)])
print('Icono generado: SVG, PNG e ICO con 7 resoluciones.')
