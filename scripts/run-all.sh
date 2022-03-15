set -ex

command=$@

${command}

# Folders are in a specific order based on how they depend on each other.
for path in core react-core extension site
do
echo -e "\n########################\n ${path}\n########################"
(cd ${path} && ${command})
done
