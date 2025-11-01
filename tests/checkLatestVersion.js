async function main() {
    const response = await fetch('https://api.github.com/repos/Kuredew/adobe-discord-rpc/releases/latest');

    if (!response.ok) {
        console.log('Error while fetching to github api') ;
        return
    }

    const data = await response.json();

    console.log(data.tag_name);
}

main();