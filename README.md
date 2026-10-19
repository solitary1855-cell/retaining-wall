# 懸臂式擋土牆分析設計（網頁版）

懸臂式擋土牆穩定分析與配筋設計的網頁計算工具，計算邏輯與「懸臂式擋土牆設計試算表.xlsx」一致。純前端靜態網頁，可直接部署到 GitHub Pages。

## 功能
- 常時 / 地震時穩定分析：抗傾覆、偏心、地盤承載（基礎規範 式4.3-1、表4.3-1）、抗滑動（止滑榫）
- 主動土壓 Coulomb（基礎規範 式7.3-5）；地震土壓依建築物基礎構造設計規範(112) 第7.3.4、7.3.5節（Mononobe-Okabe，式7.3-11～7.3-14），符號同規範（ϕ 內摩擦角、φ 地震合成角）
- 動態土壓作用點依牆體變位模式：對牆底旋轉（ΔPAE 於 2H/3）、滑移（PA 0.42H、ΔPAE 0.48H）、對牆頂旋轉（0.55H）；kh、kv 依解說3 由 PGA 計算建議值
- Ka 可選 Coulomb（式7.3-5）/ Rankine（式7.3-6，地表傾斜時採傾斜地表式），或直接指定
- Kp 可選 Rankine / Coulomb，或直接指定（可輸入 Caquot-Kerisel 查圖值）；KAE、KPE 亦可指定
- USD 配筋設計：牆身三斷面、踵版、趾版、溫度與最少鋼筋；規範可切換「公路橋梁規範（範例版）」/「112 年混凝土規範」
- 載重示意圖（常時／地震時：土壓、水壓、超載、地反力、被動土壓）與設計尺寸示意圖（含配筋位置），隨輸入即時更新
- RWD：桌機左右並排，手機以「輸入 / 結果 / 計算書」分頁切換
- 列印計算書（A4，每章換頁），可另存 PDF
- 參數自動存於瀏覽器，並可匯出 / 匯入 JSON

## 檔案
| 檔案 | 說明 |
|---|---|
| `index.html` | 頁面 |
| `style.css` | 樣式（含 RWD、深色模式、列印） |
| `calc.js` | 計算核心（可於 Node.js 載入測試） |
| `draw.js` | 擋土牆實際尺寸圖、載重示意圖（SVG，隨輸入更新） |
| `wall-dims-v2.png` | 計算書 2.1 擋土牆設計尺寸示意圖（固定圖片） |
| `app.js` | 介面、計算書產生 |
| `.nojekyll` | 讓 GitHub Pages 直接提供靜態檔 |

## 部署到 GitHub Pages
1. 在 GitHub 建立新 repository（例如 `retaining-wall`），設為 Public。
2. 將本資料夾所有檔案（共 8 個，含 `.nojekyll`）上傳到 repository 根目錄：
   ```bash
   git init
   git add .
   git commit -m "init retaining wall calculator"
   git branch -M main
   git remote add origin https://github.com/<帳號>/retaining-wall.git
   git push -u origin main
   ```
   或在 GitHub 網頁按「Add file → Upload files」直接拖曳上傳。
3. Repository → Settings → Pages → Source 選「Deploy from a branch」，Branch 選 `main`、資料夾 `/ (root)`，按 Save。
4. 約 1 分鐘後即可由 `https://<帳號>.github.io/retaining-wall/` 開啟。

## 本機使用
直接以瀏覽器開啟 `index.html` 即可，不需安裝任何套件。

## 注意
計算結果僅供設計參考，須由專業技師檢核簽證。
