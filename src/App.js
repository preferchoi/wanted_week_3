import React, { useState, useRef } from "react";
import axios from "axios";

const App = () => {
    const [inputFocus, setInputFocus] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [recommend, setRecommend] = useState([{ 'sickNm': '검색어 없음', 'sickId': 0 }]);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const cancelToken = useRef(null);

    const containsOnlyConsonantsOrVowels = (str) => {
        const regex = /([ㄱ-ㅎ]+|[ㅏ-ㅣ]+)/g;
        return regex.test(str);
    };

    const handleInputChange = async (e) => {
        const value = e.target.value;
        setInputValue(value);

        if (cancelToken.current) {
            cancelToken.current.cancel();
        }
        cancelToken.current = axios.CancelToken.source();

        if (value.trim() !== '' && !containsOnlyConsonantsOrVowels(value)) {
            const cacheKey = `sick-${value}`;
            const cachedData = localStorage.getItem(cacheKey);

            if (cachedData) {
                setRecommend(JSON.parse(cachedData));
                return;
            }

            try {
                console.info("calling api");
                const res = await axios.get(`http://localhost:4000/sick?q=${encodeURIComponent(value)}`, {
                    cancelToken: cancelToken.token,
                });
                localStorage.setItem(cacheKey, JSON.stringify(res.data));
                setRecommend(res.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    };

    const handleInputFocus = () => {
        setInputFocus(true)
    }

    const handleInputBlur = (e) => {
        setInputFocus(false)
        setSelectedIndex(-1)
        setInputValue('')
        setRecommend([{ 'sickNm': '검색어 없음', 'sickId': 0 }]);
        e.target.value = ''
    }

    const handleKeyDown = (e) => {
        switch (e.key) {
            case 'ArrowUp':
                setSelectedIndex(Math.max(selectedIndex - 1, -1));
                break;
            case 'ArrowDown':
                setSelectedIndex(Math.min(selectedIndex + 1, recommend.length - 1));
                break;
            case 'Enter':
                if (selectedIndex >= 0) {
                    const selectedValue = recommend[selectedIndex].sickNm;
                    setInputValue(selectedValue);
                }
                break;
            default:
                break;
        }
    };

    return (
        <div>
            <div>현재 검색어: {inputValue}</div>
            <br />
            <input
                type="text"
                className="search-input"
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
            />
            <button className="search-btn">🔍︎</button>

            {inputFocus && (
                <div>
                    <p>추천 검색어</p>
                    {recommend.map((el, idx) => {
                        return (
                            <div key={idx} style={{ backgroundColor: selectedIndex === idx ? 'lightgray' : 'transparent' }}                        >
                                🔍︎ {el.sickNm}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default App;