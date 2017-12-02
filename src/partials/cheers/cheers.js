const sayCheersCount = document.querySelector('[data-cheers-count]');
const sayCheersCountInfo = document.querySelector('[data-cheers-count-info]');
const sayCheersSubmit = document.querySelector('[data-cheers-submit]');
const pageKey = window.location.pathname.split('/')[2];
const pageUrl = `/cheers-receiver/?key=${pageKey}`;

fetch(pageUrl)
  .then(response => {
    if (!response.ok) throw Error(response.statusText);
    return response;
  })
  .then(response => response.text())
  .then(body => Number(body))
  .then(count => {
    const cheers = JSON.parse(localStorage.getItem('cheers')) || [];

    sayCheersCount.innerText = count;
    sayCheersCountInfo.classList.add('active');

    if (cheers.includes(pageKey)) {
      sayCheersSubmit.classList.add('active');
      sayCheersSubmit.addEventListener('click', event => event.preventDefault());
      return;
    }

    sayCheersSubmit.addEventListener('click', function(event) {
      event.preventDefault();

      fetch(pageUrl, {
        method: 'post',
      }).then(response => {
        if (!response.ok) throw Error(response.statusText);

        localStorage.setItem('cheers', JSON.stringify(cheers.concat(pageKey)));
        sayCheersCount.innerText = count + 1;
        sayCheersSubmit.classList.add('active');
      });
    });
  }, { once: true })
  .catch(console.error);
