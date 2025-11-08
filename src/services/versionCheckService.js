export default async function versionCheckService(apiURL, currentVersion, callback) {
    try {
        const response = await fetch(apiURL);

        if (response.ok) {
            const data = await response.json();

            const latestVersion = data.tag_name;
            if (latestVersion != currentVersion) {
                callback(`New Update ${latestVersion} ↗`)
                return
            }

            callback(currentVersion)

            return
        }

        console.log('Panel:: Response not ok, retrying...');
        setTimeout(checkLatestVersion, 3000);

    } catch (e) {
        console.log('Panel:: Error while trying to fetch api, ' + e);
        setTimeout(checkLatestVersion, 5000);
    }
}
