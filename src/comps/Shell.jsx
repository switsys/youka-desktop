import React, { useState, useRef, useEffect } from "react";
import { search, trending, mix, utils } from "@youka/youtube";
import { memoize, debounce } from "lodash";
import { Link } from "react-router-dom";
import { Input, Loader } from "semantic-ui-react";
import VideoList from "./VideoList";
import * as mess from "../lib/mess";
import rollbar from "../lib/rollbar";

const { shell } = require("electron");

const trending_memoize = memoize(trending);
const mix_memoize = memoize(mix);
const search_memoize = memoize(search);

export const PLAYLIST_SEARCH = "search";
export const PLAYLIST_TRENDING = "trending";
export const PLAYLIST_LIBRARY = "library";
export const PLAYLIST_MIX = "mix";

export default function Shell({ children, youtubeID, defaultPlaylist }) {
  const [videos, setVideos] = useState([]);
  const [playlist, setPlaylist] = useState(PLAYLIST_TRENDING);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef();

  useEffect(() => {
    handlePlaylistChange(defaultPlaylist);
    // eslint-disable-next-line
  }, []);

  function handlePlaylistChange(pl) {
    switch (pl) {
      case PLAYLIST_SEARCH:
        handleSearch();
        break;
      case PLAYLIST_TRENDING:
        handleTrending();
        break;
      case PLAYLIST_MIX:
        handleMix();
        break;
      case PLAYLIST_LIBRARY:
        handleLibrary();
        break;
      default:
        break;
    }
  }

  function handleClickDonate() {
    shell.openExternal("https://www.patreon.com/getyouka");
  }

  async function handleSearch() {
    setPlaylist(PLAYLIST_SEARCH);
    const query = searchRef.current.inputRef.current.value;
    if (!query || query === "") {
      setVideos([]);
      searchRef.current.focus();
      return;
    }
    doSearch(query);
  }

  async function handleTrending() {
    try {
      setLoading(true);
      setPlaylist(PLAYLIST_TRENDING);
      const results = await trending_memoize();
      setVideos(utils.cleanResults(results));
    } catch (error) {
      console.error(error);
      setVideos([]);
      rollbar.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMix() {
    try {
      setLoading(true);
      setPlaylist(PLAYLIST_MIX);
      const results = await mix_memoize(youtubeID);
      results.shift();
      setVideos(utils.cleanResults(results));
    } catch (error) {
      console.error(error);
      setVideos([]);
      rollbar.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLibrary() {
    try {
      setLoading(true);
      setPlaylist(PLAYLIST_LIBRARY);
      const libraryVideos = await mess.library();
      setVideos(libraryVideos);
    } catch (error) {
      console.error(error);
      setVideos([]);
      rollbar.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchChange(e) {
    const query = e.target.value;
    if (!query || query === "") return;
    debouncedSearch(query);
  }

  function handleSearchFocus() {
    handleSearch();
  }

  async function doSearch(query) {
    try {
      setLoading(true);
      const results = await search_memoize(query);
      const filteredResults = results.filter((r) => !r.hours && r.minutes < 10);
      setVideos(filteredResults);
    } catch (error) {
      console.error(error);
      setVideos([]);
      rollbar.error(error);
    } finally {
      setLoading(false);
    }
  }

  const debouncedSearch = debounce(doSearch, 500);

  return (
    <div>
      <div className="flex flex-row w-full justify-between p-2 mb-2 bg-primary">
        <Link
          className="self-center text-white font-bold text-3xl flex-1"
          to="/"
        >
          Youka
        </Link>
        <Input
          className="p-2 px-2 w-2/4 flex-2"
          type="text"
          onChange={handleSearchChange}
          placeholder="Search"
          onFocus={handleSearchFocus}
          ref={searchRef}
        />
        <div
          className="self-center text-white text-right font-bold cursor-pointer flex-1"
          onClick={handleClickDonate}
        >
          Help keep Youka alive
        </div>
      </div>
      {children}
      <div className="flex flex-row justify-center">
        <div
          style={{ color: playlist === PLAYLIST_SEARCH ? "#E30B17" : "black" }}
          className="p-4 text-xl cursor-pointer"
          onClick={handleSearch}
        >
          Search
        </div>
        <div
          style={{
            color: playlist === PLAYLIST_TRENDING ? "#E30B17" : "black",
          }}
          className="p-4 text-xl cursor-pointer"
          onClick={handleTrending}
        >
          Trending
        </div>
        {youtubeID ? (
          <div
            style={{ color: playlist === PLAYLIST_MIX ? "#E30B17" : "black" }}
            className="p-4 text-xl cursor-pointer"
            onClick={handleMix}
          >
            Mix
          </div>
        ) : null}
        <div
          style={{ color: playlist === PLAYLIST_LIBRARY ? "#E30B17" : "black" }}
          className="p-4 text-xl cursor-pointer"
          onClick={handleLibrary}
        >
          Library
        </div>
      </div>
      {loading ? (
        <Loader active inline="centered" />
      ) : (
        <VideoList videos={videos} />
      )}
    </div>
  );
}
