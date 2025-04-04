import { App } from '@/app';

import { ContactRoute } from '@routes/contact.route';
import { PostRoute } from '@routes/post.route';
import { UserRoute } from '@routes/user.route';
import { UploadRoute } from '@routes/upload.route';

const app = new App([
  new ContactRoute(),
  new PostRoute(),
  new UserRoute(),
  new UploadRoute(),
]);

app.listen();