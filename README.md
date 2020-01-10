# Scratch
app.get('/bookmarks') // req: user_hash, res: list of bookmarks
app.get('/bookmarks/123e4567-e89b-12d3-a456-426655442343') // req: user_hash, res: bookmark fields
app.post('/bookmarks') // req: user_hash, res: success of add bookmark
app.put('/bookmarks/123e4567-e89b-12d3-a456-426655445838') // req: user_hash, edited field, res: success of edit
app.delete('/bookmarks/123e4567-e89b-12d3-a456-426655442343') // req: user_hash

// 
APP  enter user
APP  enter password
APP  press submit
APP  hash user with password
APP  get req bookmarks with hash https://api.smartmarks.io/bookmarks
NODE get req
SQL  select user_hash encoded_bookmarks
NODE get res encoded_bookmarks
APP  decode encoded_bookmarks
APP  render bookmarks

APP  enter new bookmark
APP  encode new bookmark
APP  post req: user_hash, encoded_bookmark https://api.smartmarks.io/bookmarks
NODE post accept req
SQL  insert bookmarks, user_bookmark
NODE post res: success?
APP  if error notify

APP  edit bookmark
APP  encode bookmark
APP  put req: user_hash, encoded_bookmark https://api.smartmarks.io/bookmarks/09rn-j09ib-h76tdv
NODE put accept req
SQL  update bookmarks
NODE post res: success?
APP  if error notify

APP  delete bookmark
APP  delete req https://api.smartmarks.io/bookmarks/0i9dc-32jk-9i32gvd65
NODE delete accept req
SQL  drop row where uri is __
NODE delete res: success?
APP  if error notify