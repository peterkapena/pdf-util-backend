gs -dBATCH -dNOPAUSE -q -sDEVICE=pdfwrite -sOutputFile=output.pdf 1.pdf 2.pdf

Rotation
gs -sDEVICE=pdfwrite -o output.pdf -c "<</Rotate 90>> setpagedevice" -f input.pdf

