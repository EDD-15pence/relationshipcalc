@echo off
echo ===========================================
echo  开始生成关系 JSON 和语音文件
echo ===========================================

REM 切换到脚本目录
cd /d %~dp0

REM Step 1: 提取 relations.json
echo [1/2] 提取关系表到 relations.json...
python extract_relations.py
if %ERRORLEVEL% NEQ 0 (
    echo ❌ extract_relations.py 执行失败！
    pause
    exit /b %ERRORLEVEL%
)

REM Step 2: 生成音频
echo [2/2] 批量生成语音文件...
python gen_audio.py
if %ERRORLEVEL% NEQ 0 (
    echo ❌ gen_audio.py 执行失败！
    pause
    exit /b %ERRORLEVEL%
)

echo ✅ 全部完成！
pause
