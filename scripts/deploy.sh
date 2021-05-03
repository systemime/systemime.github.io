cd ../dist
git init
git add -A
git commit -m 'deploy'
git push -f git@github.com:systemime/systemime.github.io.git master
