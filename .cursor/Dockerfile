FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# System utilities
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    ca-certificates \
    gnupg \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# PostgreSQL 15
RUN apt-get update && apt-get install -y \
    postgresql \
    postgresql-contrib \
    && rm -rf /var/lib/apt/lists/*

# Configure PostgreSQL for local dev (matches docker-compose.yml)
RUN service postgresql start \
    && su - postgres -c "psql -c \"ALTER USER postgres PASSWORD 'password';\"" \
    && su - postgres -c "createdb rentease 2>/dev/null || true" \
    && service postgresql stop

# Allow local connections with password auth
RUN sed -i 's/local   all             all                                     peer/local   all             all                                     md5/' /etc/postgresql/*/main/pg_hba.conf \
    && sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /etc/postgresql/*/main/postgresql.conf

# Node.js 24 via nvm
ENV NVM_DIR=/root/.nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash \
    && . "$NVM_DIR/nvm.sh" \
    && nvm install 24 \
    && nvm alias default 24 \
    && nvm use default

ENV PATH="$NVM_DIR/versions/node/$(ls $NVM_DIR/versions/node)/bin:$PATH"

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

# Playwright system dependencies (browsers installed at runtime via pnpm)
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libatspi2.0-0 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2t64 \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Also install nvm for the ubuntu user (cloud agent runs as ubuntu)
RUN id -u ubuntu &>/dev/null || useradd -m -s /bin/bash ubuntu
RUN cp -r /root/.nvm /home/ubuntu/.nvm \
    && chown -R ubuntu:ubuntu /home/ubuntu/.nvm
RUN echo 'export NVM_DIR="$HOME/.nvm"' >> /home/ubuntu/.bashrc \
    && echo '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"' >> /home/ubuntu/.bashrc \
    && echo 'corepack enable 2>/dev/null' >> /home/ubuntu/.bashrc

# Passwordless sudo for service management
RUN echo "ubuntu ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/ubuntu

WORKDIR /workspace
