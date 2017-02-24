# OwlCarousel 2 Roadmap

## 2.2 - current version

## 2.3 - bugfixes, repo migration, minor features

 - [ ] clean up contributor guides
 - [ ] work through, accept or schedule PRs from current stack
 - [ ] #1602 - CSS transitions fail except for default
 - [ ] update progress in #1538
 - [ ] #1704 - viewport width detection
 - [ ] #1717 - keyboard control
 - [ ] move repo to company account (https://github.com/medienpark)

## 2.4 - finish up build pipeline, docs

 - [ ] #1330 - finish moving to gulp
 - [ ] ditto for moving to assemble for docs
 - [ ] #1666 - RTL center mode
 - [ ] #1613 - generic plugin integration

## 2.5 - cloning & worker cleanup

 - [ ] worker cleanup
 - [ ] clone computation fix (and provide consistent access to slides)
 - [ ] #1575 & #1621 - AutoHeight fixes
 - [ ] #1511 - do not disable nav when center = true & length == items

## 2.6 - cleanup, code style, repo cleanup

 - [ ] clean up code ToDos
 - [ ] fix code style
 - [ ] check whether we want to support velocity.js (at least optionally)
 - [ ] close not-yet-tagged issues older than 8 month
 - [ ] #1518 - slide change event issues (not cancelling events etc.)
 - [ ] #1563 - slide offset on last if loop = false
 - [ ] #1633 & #1627 - (merged items) swipe/autoplay (mostly testing whether the worker/clone fixes in 2.5 solved this)
 - [ ] #1723 & #1655 - Autoplay bugs

## 2.7 - bugfixes & final, "LTS" release

 - [ ] #1647 - 1px from prev. slide on current
 - [ ] #1523 - autoplay vs. video autoplay issue
 - [ ] #1471 - pause autoplay on hover
 - [ ] #1343 - timeout per slide

## 3.0 - Typescript, additional plugins, breaking changes

 - [ ] TypeScript refactoring
 - [ ] remove css-mimicking settings (such as margins) and use CSS instead
 - [ ] overlay plugin (to support overlay transitions etc.)
