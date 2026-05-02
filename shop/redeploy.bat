@echo off
echo Rebuilding royaltick-shop...

docker stop royaltick-instance
docker rm royaltick-instance

docker build ^
  --build-arg NEXT_PUBLIC_DB_URL=mongodb+srv://viktorminaylenko1377:7ECG0Wz6gqmgWReE@cluster0.ih0yizi.mongodb.net/shop?retryWrites=true^&w=majority ^
  --build-arg NEXT_PUBLIC_DB_NAME=royaltick ^
  --build-arg NEXT_PUBLIC_ACCESS_TOKEN_KEY=secureaccesstoken ^
  --build-arg NEXT_PUBLIC_REFRESH_TOKEN_KEY=securerefreshtoken ^
  --build-arg NEXT_PUBLIC_NODEMAILER_PW=anmzohxjvjlcugpc ^
  --build-arg NEXT_PUBLIC_NODEMAILER_EMAIL=viktorminaylenko1337@gmail.com ^
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBE-7iCEnZeYLyY1tNReiFqFPeN-1p6Ma8 ^
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=royaltick-9f2a4.firebaseapp.com ^
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=royaltick-9f2a4 ^
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=royaltick-9f2a4.firebasestorage.app ^
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=637653732320 ^
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=1:637653732320:web:ef0d7aa169ae165c7cf985 ^
  -t royaltick-shop .

docker run -d --name royaltick-instance -p 3000:3000 royaltick-shop
echo Done! http://localhost:3000