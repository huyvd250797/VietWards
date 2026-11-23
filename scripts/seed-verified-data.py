"""Reproducible transcription from official cited tables. Runs without dependencies.
WARNING: change values only after verifying against the linked official source.
"""
import json, pathlib, unicodedata, re
R=pathlib.Path(__file__).resolve().parents[1]
D=R/'src'/'data';D.mkdir(parents=True,exist_ok=True)
# Table 19, Niên giám thống kê 2024; area as at 2023-12-31,
# average population 2024 in thousands with one decimal (rounding 100 persons).
old_text='''Hà Nội|3359.8|8717.6
Vĩnh Phúc|1236.0|1225.3
Bắc Ninh|822.7|1546.6
Quảng Ninh|6208.0|1396.5
Hải Dương|1668.3|1978.2
Hải Phòng|1526.4|2124.5
Hưng Yên|930.2|1318.1
Thái Bình|1584.6|1890.4
Hà Nam|861.9|894.2
Nam Định|1668.8|1894.2
Ninh Bình|1411.9|1030.3
Hà Giang|7927.6|911.4
Cao Bằng|6700.4|558.5
Bắc Kạn|4853.3|329.3
Tuyên Quang|5868.0|820.3
Lào Cai|6364.3|792.2
Yên Bái|6892.7|864.4
Thái Nguyên|3522.0|1365.2
Lạng Sơn|8310.2|814.0
Bắc Giang|3895.9|1962.6
Phú Thọ|3534.6|1543.9
Điện Biên|9539.9|656.7
Lai Châu|9068.7|495.5
Sơn La|14108.9|1330.6
Hòa Bình|4590.8|894.5
Thanh Hóa|11114.7|3764.2
Nghệ An|16486.5|3472.3
Hà Tĩnh|5994.5|1329.8
Quảng Bình|7998.8|924.8
Quảng Trị|4701.2|659.2
Huế|4947.1|1178.6
Đà Nẵng|1284.7|1276.0
Quảng Nam|10574.9|1543.9
Quảng Ngãi|5155.3|1259.9
Bình Định|6066.4|1518.5
Phú Yên|5026.0|885.2
Khánh Hòa|5200.1|1269.3
Ninh Thuận|3355.8|612.7
Bình Thuận|7942.6|1266.2
Kon Tum|9677.3|601.8
Gia Lai|15510.1|1634.9
Đắk Lắk|13070.4|1946.2
Đắk Nông|6509.3|695.7
Lâm Đồng|9781.2|1362.5
Bình Phước|6873.6|1062.3
Tây Ninh|4041.7|1202.8
Bình Dương|2694.6|2870.6
Đồng Nai|5863.6|3365.4
Bà Rịa - Vũng Tàu|1982.6|1194.6
TP. Hồ Chí Minh|2095.4|9543.6
Long An|4494.8|1756.2
Tiền Giang|2556.4|1796.1
Bến Tre|2379.7|1306.3
Trà Vinh|2390.8|1023.9
Vĩnh Long|1525.7|1037.3
Đồng Tháp|3382.3|1601.1
An Giang|3536.8|1912.6
Kiên Giang|6352.1|1766.7
Cần Thơ|1440.4|1271.7
Hậu Giang|1622.2|730.0
Sóc Trăng|3298.2|1205.3
Bạc Liêu|2667.9|928.7
Cà Mau|5274.5|1212.0'''
# Official National Assembly Resolution 202/2025/QH15, area and administrative-population for the 23 newly merged units.
merged_text='''An Giang|9888.91|4952238
Bắc Ninh|4718.6|3619433
Cà Mau|7942.39|2606672
Đắk Lắk|18096.4|3346853
Đồng Nai|12737.18|4491408
Đồng Tháp|5938.64|4370046
Gia Lai|21576.53|3583693
Hưng Yên|2514.81|3567943
Khánh Hòa|8555.86|2243554
Lào Cai|13256.92|1778785
Lâm Đồng|24233.07|3872999
Ninh Bình|3942.62|4412264
Phú Thọ|9361.38|4022638
Quảng Ngãi|14832.55|2161755
Quảng Trị|12700|1870845
Tây Ninh|8536.44|3254170
Thái Nguyên|8375.21|1799489
Tuyên Quang|13795.50|1865270
Đà Nẵng|11859.59|3065628
Cần Thơ|6360.83|4199824
Hải Phòng|3194.72|4664124
TP. Hồ Chí Minh|6772.59|14002598
Vĩnh Long|6296.20|4257581'''
# Appendix 02, TT 79/2024/TT-BCA (in effect on 30 Jun 2025), spellings matched
# via canonical normalized province name with code resolution in runtime.
legacy_plates='''Cao Bằng|11
Lạng Sơn|12
Quảng Ninh|14
Hải Phòng|15,16
Thái Bình|17
Nam Định|18
Phú Thọ|19
Thái Nguyên|20
Yên Bái|21
Tuyên Quang|22
Hà Giang|23
Lào Cai|24
Lai Châu|25
Sơn La|26
Điện Biên|27
Hòa Bình|28
Hà Nội|29,30,31,32,33,40
Hải Dương|34
Ninh Bình|35
Thanh Hóa|36
Nghệ An|37
Hà Tĩnh|38
Đà Nẵng|43
Đắk Lắk|47
Đắk Nông|48
Lâm Đồng|49
TP. Hồ Chí Minh|41,50,51,52,53,54,55,56,57,58,59
Đồng Nai|39,60
Bình Dương|61
Long An|62
Tiền Giang|63
Vĩnh Long|64
Cần Thơ|65
Đồng Tháp|66
An Giang|67
Kiên Giang|68
Cà Mau|69
Tây Ninh|70
Bến Tre|71
Bà Rịa - Vũng Tàu|72
Quảng Bình|73
Quảng Trị|74
Huế|75
Quảng Ngãi|76
Bình Định|77
Phú Yên|78
Khánh Hòa|79
Gia Lai|81
Kon Tum|82
Sóc Trăng|83
Trà Vinh|84
Ninh Thuận|85
Bình Thuận|86
Vĩnh Phúc|88
Hưng Yên|89
Hà Nam|90
Quảng Nam|92
Bình Phước|93
Bạc Liêu|94
Hậu Giang|95
Bắc Kạn|97
Bắc Giang|98
Bắc Ninh|99'''
# Appendix 02, TT 51/2025/TT-BCA, from 01 July 2025 onwards.
current_plates='''An Giang|67,68
Bắc Ninh|98,99
Cà Mau|69,94
Cần Thơ|65,83,95
Cao Bằng|11
Đà Nẵng|43,92
Đắk Lắk|47,78
Điện Biên|27
Đồng Nai|39,60,93
Đồng Tháp|63,66
Gia Lai|77,81
Hà Nội|29,30,31,32,33,40
Hà Tĩnh|38
Hải Phòng|15,16,34
Hưng Yên|17,89
Khánh Hòa|79,85
Lai Châu|25
Lâm Đồng|48,49,86
Lạng Sơn|12
Lào Cai|21,24
Nghệ An|37
Ninh Bình|18,35,90
Phú Thọ|19,28,88
Quảng Ngãi|76,82
Quảng Ninh|14
Quảng Trị|73,74
Sơn La|26
Tây Ninh|62,70
Thái Nguyên|20,97
Thanh Hóa|36
Huế|75
TP. Hồ Chí Minh|41,50,51,52,53,54,55,56,57,58,59,61,72
Tuyên Quang|22,23
Vĩnh Long|64,71,84'''

def table3(txt):
 d={}
 for line in txt.splitlines():
  n,a,p=line.split('|');assert n not in d;n=n.strip();d[n]={'area':float(a),'population':int(round(float(p)*1000)) if txt is old_text else int(p)}
 return d

def plates(txt):
 d={}
 for line in txt.splitlines():
  k,codes=line.split('|');assert k not in d;d[k]=codes.split(',')
 return d

def norm(s):
 return re.sub(r'[^a-z0-9]+',' ', ''.join(c for c in unicodedata.normalize('NFD',s.lower().replace('đ','d')) if unicodedata.category(c)!='Mn').replace('tp. ','').replace('thanh pho ','').replace('tinh ','')).strip()
legacy=table3(old_text); merged=table3(merged_text);lp=plates(legacy_plates);cp=plates(current_plates)
assert len(legacy)==63,(len(legacy),list(legacy))
assert len(merged)==23 and len(lp)==63 and len(cp)==34
assert set(legacy)==set(lp),('legacy missing plates', set(legacy)^set(lp))
assert len({norm(x) for x in legacy})==63
assert set(cp)<=set(legacy),('current incorrect')
assert len(set(cp)-set(merged))==11
assert set(merged)<=set(legacy)
# Current 23 from administrative resolution, remaining 11 from the official GSO 2024 table (different reference period, explicitly labeled).
def area(value,source,date):return {'valueKm2':value,'referenceDate':date,'sourceId':source,'status':'verified'}
def population(value,kind,source,date):return {'value':value,'kind':kind,'referencePeriod':date,'sourceId':source,'status':'verified'}
rows={'before':{},'current':{}}
for name,v in legacy.items():
 rows['before'][norm(name)]={'displayName':name,'area':area(v['area'],'nso-statistics-2024','2023-12-31'),'population':population(v['population'],'statistical_average','nso-statistics-2024','2024'),'plateCodes':lp[name],'plateSourceId':'bca-79-2024','plateEffectiveFrom':'2025-01-01'}
for name,codes in cp.items():
 src=merged.get(name)
 if src:
  row={'displayName':name,'area':area(src['area'],'na-202-2025','2025-06-12'),'population':population(src['population'],'administrative_scale','na-202-2025','2025-06-12'),'plateCodes':codes,'plateSourceId':'bca-51-2025','plateEffectiveFrom':'2025-07-01'}
 else:
  old=legacy[name]
  row={'displayName':name,'area':area(old['area'],'nso-statistics-2024','2023-12-31'),'population':population(old['population'],'statistical_average','nso-statistics-2024','2024'),'plateCodes':codes,'plateSourceId':'bca-51-2025','plateEffectiveFrom':'2025-07-01'}
 rows['current'][norm(name)]=row
assert len(rows['before'])==63 and len(rows['current'])==34
# Plate number 80 is reserved for the traffic police department, not a province.
all_pl=list(x for r in cp.values() for x in r)
assert '80' not in all_pl and len(set(all_pl))==len(all_pl),('duplicate current plate',len(all_pl),len(set(all_pl)))
assert '80' not in [x for r in lp.values() for x in r]
assert rows['current']['dong nai']['plateCodes']==['39','60','93']
assert rows['before']['dong nai']['plateCodes']==['39','60']
assert rows['before']['binh phuoc']['plateCodes']==['93']

sources={
 'na-202-2025':{'id':'na-202-2025','title':'Nghị quyết 202/2025/QH15 — diện tích và quy mô dân số 23 địa phương hình thành sau sắp xếp','organization':'Quốc hội / Cổng Thông tin điện tử Chính phủ','url':'https://congbao.chinhphu.vn/tai-ve-van-ban-so-202-2025-qh15-45050-56708?format=pdf','issuedAt':'2025-06-12','notes':'Quy mô dân số hành chính, không phải dân số trung bình thống kê.'},
 'nso-statistics-2024':{'id':'nso-statistics-2024','title':'Niên giám thống kê 2024 — Bảng 19: Diện tích, dân số và mật độ dân số theo địa phương','organization':'Cục Thống kê Việt Nam','url':'https://www.nso.gov.vn/wp-content/uploads/2025/06/NGTK-Cuc-TK-2024_BQ.pdf','issuedAt':None,'notes':'Diện tích thời điểm 31/12/2023, dân số trung bình 2024, công bố đến 0,1 nghìn người (100 người).'},
 'bca-79-2024':{'id':'bca-79-2024','title':'Phụ lục 02 — Thông tư 79/2024/TT-BCA, biển số các tỉnh trước sáp nhập','organization':'Bộ Công an','url':'https://congbao.chinhphu.vn/tai-ve-van-ban-so-79-2024-tt-bca-43337-53056?format=pdf','issuedAt':'2024-11-15','notes':'Áp dụng cho chế độ lịch sử trước 01/07/2025.'},
 'bca-51-2025':{'id':'bca-51-2025','title':'Phụ lục 02 — Thông tư 51/2025/TT-BCA, biển số xe 34 tỉnh thành','organization':'Bộ Công an','url':'https://bocongan.gov.vn/media/bca-media/photo-library/20250722155624_718a2904-71b2-4a66-a97a-ea695f49cbeb-TT51.2025.TT.BCA.pdf','issuedAt':'2025-06-30','notes':'Có hiệu lực từ 01/07/2025. Mã 80 do Cục Cảnh sát giao thông quản lý, không phải mã tỉnh.'},
}
(D/'verified-province-statistics.json').write_text(json.dumps({'datasetVersion':'0.8.0','referenceChecked':'2026-11-23','data':rows},ensure_ascii=False,indent=2)+'\n')
(D/'verified-sources.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2)+'\n')
print('OK',len(rows['before']),'legacy +',len(rows['current']),'current; 23 administrative population records, 11 published statistical snapshots; plates all checked.')
