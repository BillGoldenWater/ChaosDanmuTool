1. 更新 `currentChangeLog.md`
2. 使用 `scripts/updateVersion.mjs` 增加版本
3. 运行 `scripts/updateChangeLog.mjs` 更新 changeLog.json
4. 运行 `scripts/genChangeLogMd.mjs` 生成 changeLog.md
5. commit
   - commit msg 格式 `更新 {ver}`
6. 通过 pr 应用到 release 分支 内容为 currentChangeLog.md 的内容
7. 添加 tag 到 release 分支
8. push
9. 在 release 分支上运行 actions
