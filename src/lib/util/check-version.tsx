import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

function VersionChecker() {
  const [pageVersion, setVersion] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Function to check build version from deployed static version.json
    // Note: In your server settings, please ensure this file is NOT cached in the browser
    const fetchVersion = async () => {
      try {
        const response = await fetch('/version.json');
        const data = await response.json();
        console.log (`Build Version: ${data.version}`)
        return data.version;
      } catch (error) {
        console.error('Failed to fetch version:', error);
      }
    };

    // Initial fetch on page load
    fetchVersion().then(fetchedVersion => {
      setVersion(fetchedVersion);
    });

    // Function to check version and reload if different
    const checkVersionAndUpdate = async () => {
      const fetchedVersion = await fetchVersion();
      if (fetchedVersion && fetchedVersion !== pageVersion) {
        console.log(`Expected Build Version ${fetchedVersion} and got Page Build Version ${pageVersion}, reloading page.`)
        window.location.reload();
      }
    };

    // Event listener for window focus
    window.addEventListener('focus', checkVersionAndUpdate);

    // Event listener for Next.js navigation
    const handleRouteChange = () => {
      console.log("running handleRouteChange...")
      checkVersionAndUpdate();
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // Clean up
    return () => {
      window.removeEventListener('focus', checkVersionAndUpdate);
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [pageVersion, router.events]);

  return ( <></> );
}

export default VersionChecker;
