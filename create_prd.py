from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from pathlib import Path

out=Path('PRD_個人行程與任務管理系統.docx')
doc=Document()
sec=doc.sections[0]
sec.top_margin=Inches(.65); sec.bottom_margin=Inches(.65); sec.left_margin=Inches(.75); sec.right_margin=Inches(.75)
styles=doc.styles
for stylename in ['Normal','Title','Heading 1','Heading 2']:
 st=styles[stylename]; st.font.name='Microsoft JhengHei'; st._element.rPr.rFonts.set(qn('w:eastAsia'),'Microsoft JhengHei')
styles['Normal'].font.size=Pt(9.5); styles['Normal'].font.color.rgb=RGBColor(57,60,53)
styles['Title'].font.size=Pt(26); styles['Title'].font.bold=True; styles['Title'].font.color.rgb=RGBColor(57,60,53)
styles['Heading 1'].font.size=Pt(16);styles['Heading 1'].font.bold=True;styles['Heading 1'].font.color.rgb=RGBColor(90,116,91)
styles['Heading 2'].font.size=Pt(11);styles['Heading 2'].font.bold=True;styles['Heading 2'].font.color.rgb=RGBColor(95,105,90)

p=doc.add_paragraph(style='Title');p.add_run('個人行程與任務管理系統')
p=doc.add_paragraph();r=p.add_run('產品需求文件  PRD');r.bold=True;r.font.size=Pt(12);r.font.color.rgb=RGBColor(112,132,107)
p=doc.add_paragraph('版本 1.0  |  需求狀態：初步需求確認  |  產品形態：手機優先前端原型')
p.runs[0].font.size=Pt(9);p.runs[0].font.color.rgb=RGBColor(130,135,124)

def heading(t): doc.add_heading(t,level=1)
def para(t): doc.add_paragraph(t)
def bullets(items):
 for x in items: doc.add_paragraph(x,style='List Bullet')
def table(headers, rows, widths=None):
 t=doc.add_table(rows=1, cols=len(headers));t.alignment=WD_TABLE_ALIGNMENT.CENTER;t.style='Light Shading Accent 1'
 for c,text in zip(t.rows[0].cells,headers):
  c.text=text; c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
  for run in c.paragraphs[0].runs: run.bold=True;run.font.color.rgb=RGBColor(255,255,255)
  tcPr=c._tc.get_or_add_tcPr();shd=OxmlElement('w:shd');shd.set(qn('w:fill'),'70846B');tcPr.append(shd)
 for row in rows:
  cells=t.add_row().cells
  for c,text in zip(cells,row):c.text=text;c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
 for row in t.rows:
  for cell in row.cells:
   for p in cell.paragraphs:
    p.paragraph_format.space_after=Pt(2);p.paragraph_format.space_before=Pt(2)
    for run in p.runs:run.font.size=Pt(8.5)
 doc.add_paragraph()
 return t

heading('1 產品概述')
para('本產品協助個人以手機快速掌握固定行程、個人待辦與重要期限。行程與待辦在首頁並列呈現，但各自維持不同管理方式：行程以日期、起訖時間及重複頻率安排；待辦記錄事項、期限日期，以及可選的指定時間或全天狀態。產品不主動推送提醒，使用者透過首頁期限提示掌握近期事項。')
heading('2 產品目標與設計原則')
bullets(['降低查看今日安排與近期期限的操作成本。','讓單次及週期性行程易於建立，並可用顏色快速辨識。','讓待辦保持輕量，不要求使用者為每項任務安排一段行程。','以手機為主要裝置，採柔和療癒視覺、清楚層級與易觸控操作。','期限只在首頁顯示，不發送推播、簡訊或電子郵件提醒。'])
heading('3 目標使用者與主要情境')
para('目標使用者為希望用單一工具管理日常固定安排、個人待辦與到期事項的個人使用者。典型情境包括：早上確認今日行程；新增每週固定活動並指定顏色；記錄一項需在特定日期及時間完成的任務；確認近期最重要的待辦期限。')
heading('4 範圍與優先級')
table(['優先級','功能範圍','說明'],[
('P0／原型核心','首頁日期導覽','週曆與日期切換，顯示所選日期的行程與待辦概況。'),
('P0／原型核心','行程管理','新增單次、每週或每月行程；設定日期、起訖時間、顏色及選填地點備註。'),
('P0／原型核心','待辦管理','新增事項、期限日期、指定時間或全天；可將待辦標記完成。'),
('P0／原型核心','期限提示','首頁顯示最早未完成待辦及其期限狀態；不發送主動通知。'),
('後續確認','持久化與跨裝置','現有原型資料僅存在頁面記憶體，重新整理後回復示範資料；正式產品需另定儲存與同步方案。')])
heading('5 功能需求')
doc.add_heading('5.1 首頁與日期導覽',level=2)
bullets(['顯示目前選取日期、週曆、今日行程數、未完成待辦數、近期重要期限、當日行程清單與待辦清單。','使用者可選取週曆日期、前後移動一週，或回到原型預設的今天。','選取日期變更時，當日行程及期限相對日期文案需更新。','若當日沒有行程，顯示友善空狀態；待辦列表按未完成優先及期限排序。'])
doc.add_heading('5.2 行程建立',level=2)
bullets(['必填欄位：行程名稱、日期、開始時間、結束時間、重複頻率。','重複頻率支援單次、每週、每月；顏色由預設色票選擇；地點或備註為選填。','結束時間必須晚於開始時間；不符合時阻止儲存並顯示錯誤提示。','清單顯示行程名稱、起訖時間、地點／備註及重複標籤，並以色條識別行程。','每月重複的進階規則（固定日期或第幾個星期幾）尚未確認，第一階段建議採固定日期。'])
doc.add_heading('5.3 待辦建立與完成',level=2)
bullets(['必填欄位：待辦事項、期限日期、時間模式。','時間模式提供「選擇時間」與「全天」兩種互斥選項。','選擇時間時顯示必填時間欄位；全天時隱藏時間欄位且不儲存特定時間。','待辦清單顯示期限狀態及指定時間；全天待辦以「全天」標示。','使用者可將待辦標記完成或恢復未完成；完成項目以完成狀態視覺呈現。'])
doc.add_heading('5.4 首頁期限提示',level=2)
bullets(['從未完成待辦中，依期限日期選出最早一項作為近期重要期限提示。','依選取日期顯示逾期、今天、明天或具體到期日期。','不建立或觸發推播、瀏覽器通知、電子郵件或簡訊。'])
heading('6 主要使用流程')
table(['流程','步驟'],[
('新增有時間待辦','首頁點選新增待辦 → 輸入事項 → 選期限日期 → 選擇時間並指定時刻 → 新增 → 清單顯示日期與時間。'),
('新增全天待辦','首頁點選新增待辦 → 輸入事項 → 選期限日期 → 選「全天」 → 新增 → 清單標示全天。'),
('新增重複行程','點選新增行程 → 輸入名稱、日期及起訖時間 → 選每週或每月 → 選擇色票 → 儲存。'),
('完成待辦','點選待辦左側勾選框 → 狀態切換為完成 → 未完成數與期限提示更新。')])
heading('7 介面與互動原則')
bullets(['視覺方向：柔和療癒；米白背景、鼠尾草綠為主色，搭配低飽和粉彩行程色。','手機優先：單欄內容、底部導覽、觸控友善按鈕與底部表單面板。','表單控制以清楚標籤呈現；必填欄位使用原生日期與時間選擇器。','所有新增或完成操作提供即時結果回饋；錯誤需明確說明如何修正。','色彩僅作輔助辨識，文字仍須保留行程名稱與重複資訊。'])
heading('8 資料欄位草案')
table(['物件','欄位','規則'],[
('行程 Event','title, date, startTime, endTime','名稱、日期與起訖時間為必填；結束時間晚於開始時間。'),
('行程 Event','repeatFrequency, color, place','頻率為單次／每週／每月；顏色必選；地點備註選填。'),
('待辦 Task','title, dueDate, timeMode, time','名稱及期限日期必填；timeMode 為 timed／allDay；全天時 time 為空。'),
('待辦 Task','status, createdAt（正式版建議）','status 為 open／completed；建立時間供排序及同步使用。')])
heading('9 非功能需求')
bullets(['響應式設計需支援常見手機寬度，並可在桌面瀏覽器以置中窄版預覽。','日期及時間須使用明確、可存取的原生輸入控制，避免僅依賴顏色傳遞資訊。','正式版須定義資料持久化、備份、時區與日期邊界處理；原型目前尚未實作。','應提供適當的空清單、輸入錯誤及完成狀態回饋。'])
heading('10 驗收標準')
for x in [
'可從首頁打開新增待辦表單並輸入事項與期限日期。',
'選擇「選擇時間」時，時間欄位可輸入且必填；新增後待辦顯示時間。',
'切換為「全天」時，時間欄位隱藏且不再必填；新增後待辦顯示「全天」。',
'可建立單次、每週及每月行程，選擇色票，並在所選日期行程清單中看到對應色彩與重複標籤。',
'若行程結束時間早於或等於開始時間，系統拒絕儲存並提供錯誤訊息。',
'完成一項待辦後，未完成數與首頁期限提示同步更新。',
'首頁僅呈現期限資訊，不會要求通知權限或主動推送提醒。']:
 doc.add_paragraph(x,style='List Number')
heading('11 假設、限制與待確認事項')
bullets(['本文件根據目前討論與 HTML 原型整理；未確認的內容以假設或待確認方式標記。','每月重複第一階段建議為每月同一日期；若遇無該日期的月份，正式規則待確認。','原型示範日期目前為 2026 年 10 月 30 日；正式產品須依使用者裝置日期及時區呈現。','資料保存方式、使用者登入、雲端同步、刪除／編輯功能、跨日任務及任務排序自訂方式尚未確認。','待辦選擇時間代表該待辦的指定時間點，而非占用行程時間區段；不自動建立行程。'])
heading('12 建議下一階段')
bullets(['確認任務時間點是否需要在當日首頁時間軸呈現，或只在待辦卡片中顯示。','確認每月重複的日期規則及月末缺少該日期時的處理方式。','確認正式版是否需要資料持久化、登入與跨裝置同步。','依驗收標準進行手機尺寸原型測試，再決定後端與儲存方案。'])

# Footer
footer=sec.footer.paragraphs[0];footer.alignment=WD_ALIGN_PARAGRAPH.RIGHT
r=footer.add_run('個人行程與任務管理系統  |  PRD 1.0');r.font.size=Pt(8);r.font.color.rgb=RGBColor(140,145,135)

doc.save(out)
print(out.resolve())
