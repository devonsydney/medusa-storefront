import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

function VersionChecker() {
  const [version, setVersion] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Function to fetch version
    const fetchVersion = async () => {
      console.log("running fetchVersion...")
      try {
        const response = await fetch('/version.json');
        const data = await response.json();
        console.log (`fetched version: ${data.version}`)
        return data.version;
      } catch (error) {
        console.error('Failed to fetch version:', error);
      }
    };

    // Initial fetch
    fetchVersion().then(fetchedVersion => {
      setVersion(fetchedVersion);
    });

    // Function to check version and reload if different
    const checkVersionAndUpdate = async () => {
      console.log("running checkVersionAndUpdate...")
      const fetchedVersion = await fetchVersion();
      console.log(`expected ${fetchedVersion} and page is ${version}`)
      if (fetchedVersion && fetchedVersion !== version) {
        console.log("version MISMATCH, updating")
        console.log("RELOAD PAGE (DISABLED FOR TESTING)")
        //window.location.reload();
      }
      else {
        console.log("versions MATCH, doing nothing")
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
  }, [version, router.events]);

  return ( <></> );
}

export default VersionChecker;
