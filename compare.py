import sys
from PIL import Image

ref = Image.open('Enhancement/Game page.png').convert('RGB').resize((1645, 956))
ours = Image.open(sys.argv[1]).convert('RGB').resize((1645, 956))

def lum(p): return round(0.2126*p[0]+0.7152*p[1]+0.0722*p[2])
def hexof(p): return '#%02x%02x%02x' % p

spots = [
    ('bg  left of skull ', 420, 200),
    ('bg  right of skull', 1230, 200),
    ('bg  behind skull  ', 823, 120),
    ('bg  under logo    ', 823, 620),
    ('bg  bottom right  ', 1450, 880),
    ('    skull brow    ', 823, 210),
    ('    skull cheek   ', 880, 320),
    ('    logo stroke   ', 640, 430),
]

print()
print(f'{"":<20}{"WANT":<22}{"GOT":<22}')
print('-' * 64)
off = 0
for name, x, y in spots:
    a, b = ref.getpixel((x,y)), ours.getpixel((x,y))
    la, lb = lum(a), lum(b)
    gap = lb - la
    flag = 'ok' if abs(gap) <= max(6, la*0.45) else ('TOO BRIGHT +%d' % gap if gap > 0 else 'TOO DARK %d' % gap)
    if flag != 'ok': off += 1
    print(f'{name:<20}{hexof(a)} L{la:<12}{hexof(b)} L{lb:<10}{flag}')

def avg(im):
    s = im.resize((80,46)); px = list(s.get_flattened_data() if hasattr(s,'get_flattened_data') else s.getdata())
    n = len(px)
    return tuple(round(sum(p[i] for p in px)/n) for i in range(3))
ra, oa = avg(ref), avg(ours)
print('-' * 64)
print(f'{"WHOLE FRAME":<20}{hexof(ra)} L{lum(ra):<12}{hexof(oa)} L{lum(oa):<10}')
print(f'{off} of {len(spots)} points out of range')
