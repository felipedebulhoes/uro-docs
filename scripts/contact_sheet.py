from pathlib import Path
import sys
from PIL import Image, ImageDraw, ImageFont

source = Path(sys.argv[1] if len(sys.argv) > 1 else "/home/ubuntu/webdev-static-assets/atlas-batch-01")
files = sorted(source.glob("*.jpg"))
thumb_w, thumb_h, label_h, columns = 260, 190, 46, 2
rows = (len(files) + columns - 1) // columns
sheet = Image.new("RGB", (columns * thumb_w, rows * (thumb_h + label_h)), "#101820")
draw = ImageDraw.Draw(sheet)
font = ImageFont.load_default()

for index, file_path in enumerate(files):
    image = Image.open(file_path).convert("RGB")
    image.thumbnail((thumb_w - 16, thumb_h - 16))
    x = (index % columns) * thumb_w + (thumb_w - image.width) // 2
    y = (index // columns) * (thumb_h + label_h) + (thumb_h - image.height) // 2
    sheet.paste(image, (x, y))
    label = file_path.stem.replace("_", " ")
    draw.text((index % columns * thumb_w + 8, (index // columns + 1) * thumb_h + (index // columns) * label_h + 8), label[:40], fill="white", font=font)

sheet.save(source / "contact-sheet.jpg", quality=92)
