exports.meta = { title: 'Home' };

exports.render = async () => `
  <h1>Welcome</h1>
  <form method="GET" action="/profile">
    <input name="name" placeholder="Your name" />
    <button>See Profile</button>
  </form>
`;