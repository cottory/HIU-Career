# main.py

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH # 정렬하는 방법
from docx.enum.table import WD_ALIGN_VERTICAL
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.shared import Cm, Inches, Pt

def __init_Document__():
    print("init Document")

def _set_table_header():
    print("set_table_header")

def _set_table_body():
    print("set_table_body")

def _set_table_tail():
    print("set_table_tail")


document = Document()

style = document.styles['Normal']
font = style.font
# font.name = 'Arial'
font.size = Pt(10)

# paragraph.style = document.styles['Normal']


heading = document.add_heading('봉사장학생 근무확인표')
heading.alignment = WD_ALIGN_PARAGRAPH.CENTER # 가운데 정렬하는 방법
# 같은 의미:: paragraph.alignment = 0  # for left, 1 for right, 2 center, 3 justify ....

paragraph = document.add_paragraph('(9999학년도 9월분)')
paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT # 왼쪽 정렬하는 방법

# make the table architecture
table_head_1 = document.add_table(rows = 1, cols = 1, style='Table Grid')
# table_head_1.allow_autofit = False

table_head_2 = document.add_table(rows = 2, cols = 4, style='Table Grid')
# table_head_2.allow_autofit = False

table_body = document.add_table(rows = 1, cols = 9, style='Table Grid')
# table_body.allow_autofit = False

table_tail_1 = document.add_table(rows = 1, cols = 3, style='Table Grid')
table_tail_2 = document.add_table(rows = 1, cols = 1, style='Table Grid')


# make the table alignment
table_head_1.alignment = WD_TABLE_ALIGNMENT.CENTER
table_head_2.alignment = WD_TABLE_ALIGNMENT.CENTER

table_body.alignment = WD_TABLE_ALIGNMENT.CENTER

table_tail_1.alignment = WD_TABLE_ALIGNMENT.CENTER
table_tail_2.alignment = WD_TABLE_ALIGNMENT.CENTER


# push contents
table_head_1_row = table_head_1.rows[0]
table_head_1_row.cells[0].text = '너굴대학 너굴학부 너굴학과 4학년'

# push contents at table_head_2
table_head_2.cell(0, 0).text = '성 명'
table_head_2.cell(1, 0).text = '근무부서'
table_head_2.cell(0, 2).text = '학 번'
table_head_2.cell(1, 2).text = '봉사분야'

# push contents adjust alignment at table_body
table_body_text = ['근무월일', '요일', '근무시간', '근로 상세내역', '계', '누 계', '학생 확인', '담당자 확인', '부서장 확인']

for i in range(len(table_body_text)):
    table_body.cell(0, i).text = table_body_text[i]
    table_body.cell(0, i).vertical_alignment = WD_ALIGN_VERTICAL.CENTER

table_body_cells = table_body.rows[0].cells
table_body_cells[2].width = Cm(7)
table_body_cells[3].width = Cm(7)

'''
SET YOUR TABLE BODY CODE






'''

# push contents at table_tail_1
table_tail_1_text = ['기준근무시간 : □99시간  □99시간  □99시간', '총 근무시간    시간   분 (인)', '근무평정    초 과 · 부 족 (   시간    분)']

for i in range(len(table_tail_1_text)):
    table_tail_1.cell(0, i).text = table_tail_1_text[i]
    table_tail_1.cell(0, i).vertical_alignment = WD_ALIGN_VERTICAL.CENTER

# push contents at table_tail_2
table_tail_2_cells = table_tail_2.rows[0].cells
p = table_tail_2_cells[0].add_paragraph('1. 봉사장학생은 근무부서 부서장의 지시에 따라 성실히 근무에 임하여야 하며, 근무성적이 불량하거나 지시에 불응하여 계속 근무가 곤란하다고 판단 될 때에는 봉사장학생 자격을 취소할 수 있습니다.')
p.alignment=WD_ALIGN_PARAGRAPH.LEFT
p = table_tail_2_cells[0].add_paragraph('2. 월정액(월999,999원) 봉사장학생은 근무시간이 월 99시간 기준이며, 99시간을 근무하지 않은 경우에는 봉사 장학금이 지급되지 않고, 시간급일 경우 월99시간(시간9급,9급은 월99시간)을 초과하여 근무할 수 없습니다.')
p.alignment=WD_ALIGN_PARAGRAPH.LEFT
p = table_tail_2_cells[0].add_paragraph('3. 봉사장학금은 학생의 클래스넷 개인정보에 입력된 계좌번호로 매월 99일 입금합니다.')
p.alignment=WD_ALIGN_PARAGRAPH.LEFT
p = table_tail_2_cells[0].add_paragraph('4. 각 부서장은 봉사장학생의 대리근무 여부 및 재학생 이외의 부적격자(휴학, 제적, 졸업생 등)가 근로를 하는 일이 없도록 관리를 철저히 하여 주시기 바랍니다.')
p.alignment=WD_ALIGN_PARAGRAPH.LEFT
p = table_tail_2_cells[0].add_paragraph('5. 월별 봉사장학생 근무확인표 원본은 해당부서에서 보관하시기 바랍니다.')
p.alignment=WD_ALIGN_PARAGRAPH.LEFT
p = table_tail_2_cells[0].add_paragraph('6. 봉사장학생 근무확인표는 근무부서에서 수정하여 사용할 수 있습니다.(근무시간, 학생-담당자-부서장 확인 필수)')
p.alignment=WD_ALIGN_PARAGRAPH.LEFT



document.save('test.docx')

__init_Document__()
_set_table_header()
_set_table_body()
_set_table_tail()