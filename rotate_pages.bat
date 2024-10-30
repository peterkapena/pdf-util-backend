@echo off
setlocal enabledelayedexpansion

:: Usage: rotate_pages.bat input.pdf output.pdf rotation_angle page_numbers
:: Example: rotate_pages.bat input.pdf output.pdf 90 1 3 5

set "input_file=%1"
set "output_file=%2"
set "rotation_angle=%3"
shift
shift
shift

:: Collect the remaining arguments as pages to rotate
set pages_to_rotate=
:loop
if "%~1"=="" goto after_loop
set pages_to_rotate=!pages_to_rotate! %1
shift
goto loop
:after_loop

:: Create a temporary directory for intermediate files
set "temp_dir=%temp%\rotate_pdf_temp"
if exist "%temp_dir%" rd /s /q "%temp_dir%"
mkdir "%temp_dir%"

:: Get the total number of pages in the PDF
for /f "delims=" %%p in ('gs -q -dNODISPLAY -c "(%input_file%) (r) file runpdfbegin pdfpagecount = quit"') do set total_pages=%%p

:: Extract each page into a separate PDF
for /L %%i in (1,1,%total_pages%) do (
    gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -dSAFER -sOutputFile="%temp_dir%\page_%%i.pdf" -dFirstPage=%%i -dLastPage=%%i "%input_file%"
)

:: Rotate specified pages
for %%p in (%pages_to_rotate%) do (
    if %%p LEQ %total_pages% (
        gs -sDEVICE=pdfwrite -o "%temp_dir%\page_%%p_rotated.pdf" -c "<</Rotate %rotation_angle%>> setpagedevice" -f "%temp_dir%\page_%%p.pdf"
        move /y "%temp_dir%\page_%%p_rotated.pdf" "%temp_dir%\page_%%p.pdf" >nul
    ) else (
        echo Page %%p is out of range. Skipping.
    )
)

:: Merge all pages back together in order
gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -dSAFER -sOutputFile="%output_file%" "%temp_dir%\page_*.pdf"

:: Clean up temporary files
rd /s /q "%temp_dir%"

echo Rotation and merging complete! Output saved to %output_file%
