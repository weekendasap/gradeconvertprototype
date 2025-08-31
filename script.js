document.addEventListener('DOMContentLoaded', () => {
    const totalStudentsInput = document.getElementById('totalStudents');

    const calculateBtn = document.getElementById('calculateBtn');
    const calculateBtnMobile = document.getElementById('calculateBtnMobile');
    const resetBtn = document.getElementById('resetBtn');
    const resetBtnMobile = document.getElementById('resetBtnMobile');

    const gradeResultsDiv = document.getElementById('gradeResults');
    const averageGrade9Div = document.getElementById('averageGrade9');
    const overallPercentageDiv = document.getElementById('overallPercentage');
    const validationSummary = document.getElementById('validationSummary');
    const resultSection = document.getElementById('resultSection');

    const subjects = [
        { id: 'koreanRank', name: '국어' },
        { id: 'englishRank', name: '영어' },
        { id: 'mathRank', name: '수학' },
        { id: 'scienceRank', name: '과학' },
        { id: 'historyRank', name: '역사' },
        { id: 'peRank', name: '체육' },
        { id: 'artRank', name: '미술' },
        { id: 'socialRank', name: '사회' }
    ];

    function convertPercentileTo9Grade(percentile) {
        if (percentile <= 4) return 1;
        else if (percentile <= 11) return 2;
        else if (percentile <= 23) return 3;
        else if (percentile <= 40) return 4;
        else if (percentile <= 60) return 5;
        else if (percentile <= 77) return 6;
        else if (percentile <= 89) return 7;
        else if (percentile <= 96) return 8;
        else return 9;
    }

    // 유틸: 에러 표시/해제
    function setFieldError(inputEl, message) {
        const group = inputEl.closest('.input-group');
        const errorElId = inputEl.id + 'Error';
        let errorEl = document.getElementById(errorElId);
        if (!errorEl) {
            // 폴백: 동적 생성
            errorEl = document.createElement('div');
            errorEl.className = 'error-message';
            errorEl.id = errorElId;
            group.appendChild(errorEl);
        }

        if (message) {
            group.classList.add('invalid');
            errorEl.textContent = message;
        } else {
            group.classList.remove('invalid');
            errorEl.textContent = '';
        }
    }

    function clearAllErrors() {
        document.querySelectorAll('.input-group.invalid').forEach(g => g.classList.remove('invalid'));
        document.querySelectorAll('.error-message').forEach(e => (e.textContent = ''));
        validationSummary.textContent = '';
        validationSummary.classList.remove('show');
    }

    function validateInputs() {
        clearAllErrors();
        let hasError = false;

        const totalStudents = parseInt(totalStudentsInput.value);
        if (isNaN(totalStudents) || totalStudents <= 0) {
            setFieldError(totalStudentsInput, '전체 학생 수를 1 이상의 숫자로 입력하세요.');
            hasError = true;
        }

        subjects.forEach(s => {
            const el = document.getElementById(s.id);
            const val = el.value === '' ? '' : parseInt(el.value);
            if (val === '') {
                setFieldError(el, '');
                return;
            }
            if (isNaN(totalStudents) || totalStudents <= 0) {
                // 전체 학생 수가 유효하지 않으면 상세 검증 보류
                setFieldError(el, '');
                return;
            }
            if (isNaN(val) || val < 1 || val > totalStudents) {
                setFieldError(el, `1 이상, 전체 학생 수(${totalStudents}) 이하로 입력하세요.`);
                hasError = true;
            } else {
                setFieldError(el, '');
            }
        });

        if (hasError) {
            validationSummary.textContent = '일부 입력값을 확인해주세요. 빨간 안내문을 참고하여 수정하면 계산할 수 있습니다.';
            validationSummary.classList.add('show');
        }
        return !hasError;
    }

    function calculateResults() {
        const isValid = validateInputs();
        if (!isValid) {
            gradeResultsDiv.innerHTML = '';
            averageGrade9Div.innerHTML = '';
            overallPercentageDiv.innerHTML = '';
            return;
        }

        const totalStudents = parseInt(totalStudentsInput.value);

        gradeResultsDiv.innerHTML = '';
        let sum9Grade = 0;
        let validSubjectCount = 0;
        let totalPercentile = 0;

        subjects.forEach(subject => {
            const inputElement = document.getElementById(subject.id);
            const raw = inputElement.value;
            const myRank = raw === '' ? NaN : parseInt(raw);

            if (isNaN(myRank)) {
                // 미입력: 계산 제외
                return;
            }

            const percentile = ((myRank / totalStudents) * 100);
            const percentileStr = percentile.toFixed(2);
            const grade9 = convertPercentileTo9Grade(percentile);

            gradeResultsDiv.innerHTML += `
                <div class="grade-result-item">
                    <strong>${subject.name}</strong><br>
                    내 등수: ${myRank}등 / ${totalStudents}명<br>
                    상위 백분위: <span class="pill pill-blue">${percentileStr}%</span><br>
                    9등급제: <span class="pill pill-red">${grade9}등급</span>
                </div>
            `;
            sum9Grade += grade9;
            validSubjectCount++;
            totalPercentile += percentile;
        });

        if (validSubjectCount > 0) {
            const average9Grade = (sum9Grade / validSubjectCount);
            const average9GradeStr = average9Grade.toFixed(2);
            const finalAverage9Grade = Math.round(average9Grade);
            const averagePercentile = (totalPercentile / validSubjectCount);
            const averagePercentileStr = averagePercentile.toFixed(2);

            averageGrade9Div.innerHTML = `
                전체 과목 평균 9등급제: <span class="pill pill-red big">${finalAverage9Grade}등급</span>
                <span class="sub">(세부 평균: ${average9GradeStr}등급)</span>
            `;

            overallPercentageDiv.innerHTML = `
                <p>입력된 과목 기준 평균으로 추정:</p>
                <p>전체 1학년 중 <span class="pill pill-blue big">상위 ${averagePercentileStr}%</span></p>
                <p class="sub muted">(과목별 등수의 평균 백분위)</p>
            `;

            // 결과 영역으로 스크롤 (모바일 UX)
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            averageGrade9Div.innerHTML = `평균 등급을 계산하려면 과목별 등수를 하나 이상 입력해주세요.`;
            overallPercentageDiv.innerHTML = ``;
        }
    }

    // 디바운스 유틸
    function debounce(fn, delay = 400) {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    const debouncedCalc = debounce(calculateResults, 400);

    // 이벤트 바인딩
    [calculateBtn, calculateBtnMobile].forEach(btn => btn && btn.addEventListener('click', calculateResults));
    [resetBtn, resetBtnMobile].forEach(btn => btn && btn.addEventListener('click', () => {
        // 입력 초기화
        totalStudentsInput.value = '';
        subjects.forEach(s => {
            const el = document.getElementById(s.id);
            el.value = '';
        });
        // 결과 및 에러 초기화
        gradeResultsDiv.innerHTML = '';
        averageGrade9Div.innerHTML = '';
        overallPercentageDiv.innerHTML = '';
        clearAllErrors();

        // 최상단으로 이동 (모바일 UX)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }));

    // 입력 시 자동 계산
    totalStudentsInput.addEventListener('input', debouncedCalc);
    subjects.forEach(s => {
        const el = document.getElementById(s.id);
        el.addEventListener('input', debouncedCalc);
    });
});