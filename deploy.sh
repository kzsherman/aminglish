#!/usr/bin/env bash
# Деплой ieltsclub.kz с GitHub на сервер.
# Запуск на сервере от root:  bash /root/deploy-ieltsclub.sh
#
# Как работает:
#   1. Держит клон репозитория в $REPO_DIR (первый запуск — clone, дальше — fetch + reset).
#   2. Выгружает файлы последнего коммита (git archive) во временную папку,
#      убирает служебные (README, deploy.sh) и подменяет $WEB_ROOT целиком одним mv —
#      посетитель никогда не видит полуобновлённый сайт.
#   3. Предыдущая версия сохраняется в $WEB_ROOT.prev — откат: см. в конце файла.
#   nginx перезагружать не нужно: сайт статический.

set -euo pipefail

REPO_URL="https://github.com/kzsherman/aminglish.git"
BRANCH="main"
REPO_DIR="/srv/repos/aminglish"
WEB_ROOT="/var/www/ieltsclub.kz"
EXCLUDE=("README.md" "deploy.sh" ".gitignore" ".gitattributes")

log() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
die() { printf '\033[1;31mОшибка:\033[0m %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "запускать от root"
command -v git >/dev/null || die "нет git: apt install git"

# 1. Получить свежий код
if [ -d "$REPO_DIR/.git" ]; then
    log "Обновляю $REPO_DIR"
    git -C "$REPO_DIR" fetch --quiet origin "$BRANCH"
    git -C "$REPO_DIR" reset --quiet --hard "origin/$BRANCH"
else
    log "Клонирую $REPO_URL в $REPO_DIR"
    mkdir -p "$(dirname "$REPO_DIR")"
    git clone --quiet --branch "$BRANCH" "$REPO_URL" "$REPO_DIR"
fi

# 2. Собрать новую версию во временной папке рядом с сайтом
NEW="${WEB_ROOT}.new"
rm -rf "$NEW"
mkdir -p "$NEW"
git -C "$REPO_DIR" archive HEAD | tar -x -C "$NEW"
for f in "${EXCLUDE[@]}"; do rm -f "$NEW/$f"; done

# Защита: без index.html не выкладываем
[ -f "$NEW/index.html" ] || { rm -rf "$NEW"; die "в репозитории нет index.html — деплой отменён"; }

# Права: nginx (www-data) читает, но не пишет
find "$NEW" -type d -exec chmod 755 {} +
find "$NEW" -type f -exec chmod 644 {} +

# 3. Подменить сайт
log "Выкладываю в $WEB_ROOT"
rm -rf "${WEB_ROOT}.prev"
[ -e "$WEB_ROOT" ] && mv "$WEB_ROOT" "${WEB_ROOT}.prev"
mv "$NEW" "$WEB_ROOT"

COMMIT="$(git -C "$REPO_DIR" log -1 --format='%h %s (%cd)' --date=format:'%Y-%m-%d %H:%M')"
log "Готово: $COMMIT"
ls -1 "$WEB_ROOT"

# Откат на предыдущую версию, если что-то пошло не так:
#   mv /var/www/ieltsclub.kz /var/www/ieltsclub.kz.bad && mv /var/www/ieltsclub.kz.prev /var/www/ieltsclub.kz
