#!/bin/sh
set -e

cd /workspace/backend
alembic upgrade head
exec "$@"
