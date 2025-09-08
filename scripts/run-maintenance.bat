@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ================================
echo 🎯 关系计算器项目维护脚本
echo ================================
echo.

set "start_time=%time%"
set "success_count=0"
set "total_steps=6"

echo 🔍 检查依赖...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装或不可用
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js: %%i
)

python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 未安装或不可用
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('python --version') do echo ✅ Python: %%i
)

echo.
echo ================================
echo 🚀 开始维护流程
echo ================================

echo.
echo 📋 步骤 1/3
echo 🚀 运行测试，发现未收录关系
echo 运行: 01-test\test.js
cd /d "%~dp0\01-test"
node test.js
if errorlevel 1 (
    echo ❌ 步骤 1 失败
    pause
    exit /b 1
) else (
    echo ✅ 步骤 1 完成
    set /a success_count+=1
)

echo.
echo 📋 步骤 2/6
echo 🚀 验证缺失关系
echo 运行: 02-validate\validate-missing.js
cd /d "%~dp0\02-validate"
node validate-missing.js
if errorlevel 1 (
    echo ❌ 步骤 2 失败
    pause
    exit /b 1
) else (
    echo ✅ 步骤 2 完成
    set /a success_count+=1
)

echo.
echo 📋 步骤 3/6
echo 🚀 同步缺失关系到代码
echo 运行: 03-sync\sync-missing-to-index.js
cd /d "%~dp0\03-sync"
node sync-missing-to-index.js
if errorlevel 1 (
    echo ❌ 步骤 3 失败
    pause
    exit /b 1
) else (
    echo ✅ 步骤 3 完成
    set /a success_count+=1
)

echo.
echo 📋 步骤 4/6
echo 🚀 规范化关系名称
echo 运行: 04-normalize\run-normalize.js
cd /d "%~dp0\04-normalize"
node run-normalize.js
if errorlevel 1 (
    echo ❌ 步骤 4 失败
    pause
    exit /b 1
) else (
    echo ✅ 步骤 4 完成
    set /a success_count+=1
)

echo.
echo 📋 步骤 5/6
echo 🚀 提取关系到 relations.json
echo 运行: data\extract_relations.py
cd /d "%~dp0\data"
python extract_relations.py
if errorlevel 1 (
    echo ❌ 步骤 5 失败
    pause
    exit /b 1
) else (
    echo ✅ 步骤 5 完成
    set /a success_count+=1
)

echo.
echo 📋 步骤 6/6
echo 🚀 生成音频并上传到 GitHub
echo 运行: 05-audio\upload_to_github.py
cd /d "%~dp0\05-audio"
python upload_to_github.py
if errorlevel 1 (
    echo ❌ 步骤 6 失败
    pause
    exit /b 1
) else (
    echo ✅ 步骤 6 完成
    set /a success_count+=1
)

echo.
echo ================================
echo 🎉 维护流程完成！
echo ================================
echo ✅ 成功完成: %success_count%/%total_steps% 个步骤
echo.
echo 📋 完成的任务:
echo   • 测试关系计算逻辑
echo   • 验证缺失关系
echo   • 同步缺失关系到代码
echo   • 规范化关系名称
echo   • 提取关系到 relations.json
echo   • 生成音频并上传到 GitHub
echo.
echo 🚀 项目维护完成！音频文件已可通过 CDN 访问
echo.

pause
