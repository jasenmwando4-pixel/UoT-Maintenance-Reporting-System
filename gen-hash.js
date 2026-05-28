const bcrypt = require('bcrypt');
(async()=>{
  try{
    const hash = await bcrypt.hash('newpassword123', 10);
    console.log(hash);
  }catch(e){
    console.error('ERR', e.message);
    process.exit(1);
  }
})();
