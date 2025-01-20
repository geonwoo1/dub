module.exports = {
    apps: [
        {
            name: 'dubify-api', // pm2 name
            script: 'dist/main.js', // // 앱 실행 스크립트
            instances: 3, // 클러스터 모드 사용 시 생성할 인스턴스 수
            exec_mode: 'cluster', // fork, cluster 모드 중 선택
            merge_logs: true, // 클러스터 모드 사용 시 각 클러스터에서 생성되는 로그를 한 파일로 합쳐준다.
            autorestart: true, // 프로세스 실패 시 자동으로 재시작할지 선택
            //watch: true,
            max_memory_restart: "1G", // 프로그램의 메모리 크기가 일정 크기 이상이 되면 재시작한다.
            // env 운영 환경설정 (--env prod 옵션으로 지정할 수 있다.)
            env_local: {

                NODE_ENV: 'local',
            },
            env_dev: {
                // 개발 환경설정
                NODE_ENV: 'dev',
            },
            env_prod: {

                NODE_ENV: 'prod',
            },
            ignore_watch : ["downloads/*", "download/*", "storage/*", "node_modules/*"],
            node_args: '--max-old-space-size=1024',  //heap memory 사용량
        },
    ]
}; 