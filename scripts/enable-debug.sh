#!/usr/bin/env bash
for v in 9 10 11 12 13 14 15 16; do
  defaults write com.adobe.CSXS.$v PlayerDebugMode 1
done
echo "PlayerDebugMode ativado (CSXS 9-16)."