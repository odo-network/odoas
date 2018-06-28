echo '
    ---------------------------------
       Starting Post Deploy Handler
    ---------------------------------
';

echo "-- pwd: $(pwd)";
echo "-- env: ${1}";

echo "-- sourcing shell profile";
. ./internals/scripts/profile.sh;

echo "-- clearing node_modules";
rm -rf ./node_modules;

echo "-- Searching For nvm version";

nvm which;

echo "-- Installing Redis Configuration";

sudo cp -f ./apps/redis/redis.conf ~/odows/redis.conf;

echo "-- Installing node_modules";

yarn;

echo "-- running build:${1}";

yarn build:$1;

echo "-- running start:${1}";

yarn start:$1;

echo "
    ---------------------------------
       ${1} Deployment Complete
    ---------------------------------
";
