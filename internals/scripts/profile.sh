# IMPORTANT - THIS SHOULD BE SOURCED BY .bashrc - AT THE TOP 

export NVM_V2_VERSION=$(cat ./.nvmrc | tr -d '\n');

echo "Using NVM_V2_VERSION ${NVM_V2_VERSION}";

# if [ -z "$HOME" ]; then 
#     HOME="/home/";
# fi

# set PATH so it includes user's private bin directories
PATH="$HOME/bin:$HOME/.local/bin:$PATH"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

alias pm2="npx ${HOME}/v2/source/node_modules/pm2/bin/pm2"
alias odows="npx ${HOME}/v2/source/node_modules/pm2/bin/pm2 trigger controls"

nvm install "${NVM_V2_VERSION}";
nvm use "${NVM_V2_VERSION}";
nvm alias default "${NVM_V2_VERSION}";

