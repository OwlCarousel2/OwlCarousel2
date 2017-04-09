# OwlCarousel 2 Roadmap

You can discuss the roadmap here: #1756

## 2.2 - current version

## 2.3 - bugfixes, repo migration, minor features

 - [ ] clean up contributor guides
 - [ ] work through, accept or schedule PRs from current stack
 - [ ] [#1602](https://github.com/OwlCarousel2/OwlCarousel2/issues/1602) - CSS transitions fail except for default
 - [ ] update progress in [#1538](https://github.com/OwlCarousel2/OwlCarousel2/issues/1538)
 - [ ] [#1704](https://github.com/OwlCarousel2/OwlCarousel2/issues/1704) - viewport width detection
 - [ ] [#1717](https://github.com/OwlCarousel2/OwlCarousel2/issues/1717) - keyboard control
 - [ ] move repo to company account (https://github.com/medienpark)

## 2.4 - finish up build pipeline, docs

 - [ ] [#1330](https://github.com/OwlCarousel2/OwlCarousel2/issues/1330) - finish moving to gulp
 - [ ] ditto for moving to assemble for docs
 - [ ] [#1666](https://github.com/OwlCarousel2/OwlCarousel2/issues/1666) - RTL center mode
 - [ ] [#1613](https://github.com/OwlCarousel2/OwlCarousel2/issues/1613) - generic plugin integration

## 2.5 - cloning & worker cleanup

 - [ ] worker cleanup
 - [ ] clone computation fix (and provide consistent access to slides)
 - [ ] [#1575](https://github.com/OwlCarousel2/OwlCarousel2/issues/1575) & [#1621](https://github.com/OwlCarousel2/OwlCarousel2/issues/1621) - AutoHeight fixes
 - [ ] [#1511](https://github.com/OwlCarousel2/OwlCarousel2/issues/1511) - do not disable nav when center = true & length == items

## 2.6 - cleanup, code style, repo cleanup

 - [ ] clean up code ToDos
 - [ ] fix code style
 - [ ] check whether we want to support velocity.js (at least optionally)
 - [ ] close not-yet-tagged issues older than 8 month
 - [ ] [#1518](https://github.com/OwlCarousel2/OwlCarousel2/issues/1518) - slide change event issues (not cancelling events etc.)
 - [ ] [#1563](https://github.com/OwlCarousel2/OwlCarousel2/issues/1563) - slide offset on last if loop = false
 - [ ] [#1633](https://github.com/OwlCarousel2/OwlCarousel2/issues/1633) & [#1627](https://github.com/OwlCarousel2/OwlCarousel2/issues/1627) - (merged items) swipe/autoplay (mostly testing whether the worker/clone fixes in 2.5 solved this)
 - [ ] [#1723](https://github.com/OwlCarousel2/OwlCarousel2/issues/1723) & [#1655](https://github.com/OwlCarousel2/OwlCarousel2/issues/1655) - Autoplay bugs

## 2.7 - bugfixes & final, "LTS" 2.x release

 - [ ] [#1647](https://github.com/OwlCarousel2/OwlCarousel2/issues/1647) - 1px from prev. slide on current
 - [ ] [#1523](https://github.com/OwlCarousel2/OwlCarousel2/issues/1523) - autoplay vs. video autoplay issue
 - [ ] [#1471](https://github.com/OwlCarousel2/OwlCarousel2/issues/1471) - pause autoplay on hover
 - [ ] [#1343](https://github.com/OwlCarousel2/OwlCarousel2/issues/1343) - timeout per slide

## 3.0 - Typescript, additional plugins, breaking changes

 - [ ] TypeScript refactoring
 - [ ] remove css-mimicking settings (such as margins) and use CSS instead
 - [ ] overlay plugin (to support overlay transitions etc.)
