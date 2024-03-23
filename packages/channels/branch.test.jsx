import { describe, test, beforeEach } from 'vitest';
import './with-resolvers-polyfill.js';
import { fixtureSetup } from 'test-utils/fixtures';
import { subject } from './generators.js';
import { branch } from './branch.js';
import { Cat, CatCount, CatNames } from './test-cats.jsx';

beforeEach(fixtureSetup);

beforeEach(context => {
    context.childHTML = () => [
        ...context.fixture.childNodes
    ].map(cn => cn.outerHTML ?? cn);
});

describe('promise', () => {

    test('...transforms', async ({ fixture, find, expect, childHTML }) => {
        const promise = Promise.resolve(['felix', 'duchess', 'stimpy']);
        const [Count, List, Map] = branch(
            promise,
            CatCount, CatNames,
            [Cat, { map: true }]
        );
        fixture.append(<Count />, <List />, <Map />);
        expect(fixture.innerHTML).toMatchInlineSnapshot(`"<!--0--><!--0--><!--0-->"`);

        await find('felix');
        expect(childHTML()).toMatchInlineSnapshot(`
          [
            "<p>3<!--1--> cats</p>",
            <!--1-->,
            "<ul><li>felix<!--1--></li><li>duchess<!--1--></li><li>stimpy<!--1--></li><!--3--></ul>",
            <!--1-->,
            "<p><!--0--></p>",
            "<p><!--0--></p>",
            "<p><!--0--></p>",
            <!--3-->,
          ]
        `);
    });

    test('all transform/option combos', async ({
        fixture, find, expect, childHTML
    }) => {
        const { promise, resolve } = Promise.withResolvers();

        const Channels = branch(
            promise,
            [null, { start: 'start' }],
            [null, { init: 'init' }],
            [name => 'second', { start: 'first' }],
            [name => name, { start: 'one', init: 'two' }],
            [name => name.toUpperCase(), { init: 'felix' }],
            null,
            name => `${name}!`,
            [name => name[0]],
        );

        expect(Channels.length).toBe(8);
        fixture.append(...Channels.map(C => <C />));
        expect(childHTML()).toMatchInlineSnapshot(`
          [
            start,
            <!--1-->,
            init,
            <!--1-->,
            first,
            <!--1-->,
            one,
            <!--1-->,
            FELIX,
            <!--1-->,
            <!--0-->,
            <!--0-->,
            <!--0-->,
          ]
        `);

        await find('two', { exact: false });
        expect(childHTML()).toMatchInlineSnapshot(`
          [
            start,
            <!--1-->,
            init,
            <!--1-->,
            first,
            <!--1-->,
            two,
            <!--1-->,
            FELIX,
            <!--1-->,
            <!--0-->,
            <!--0-->,
            <!--0-->,
          ]
        `);

        resolve('cat-');
        await find('CAT-', { exact: false });
        expect(childHTML()).toMatchInlineSnapshot(`
          [
            cat-,
            <!--1-->,
            cat-,
            <!--1-->,
            second,
            <!--1-->,
            cat-,
            <!--1-->,
            CAT-,
            <!--1-->,
            cat-,
            <!--1-->,
            cat-!,
            <!--1-->,
            c,
            <!--1-->,
          ]
        `);
    });

});

describe('async iterator', () => {

    test('...transforms', async ({ fixture, find, expect, childHTML }) => {
        const [cats, next] = subject();
        const [Count, List, Map] = branch(
            cats,
            CatCount, CatNames,
            [Cat, { map: true }]
        );
        fixture.append(<Count />, <List />, <Map />);
        expect(fixture.innerHTML).toMatchInlineSnapshot(`"<!--0--><!--0--><!--0-->"`);

        next(['felix', 'duchess', 'stimpy']);
        await find('felix');
        expect(childHTML())
            .toMatchInlineSnapshot(`
              [
                "<p>3<!--1--> cats</p>",
                <!--1-->,
                "<ul><li>felix<!--1--></li><li>duchess<!--1--></li><li>stimpy<!--1--></li><!--3--></ul>",
                <!--1-->,
                "<p><!--0--></p>",
                "<p><!--0--></p>",
                "<p><!--0--></p>",
                <!--3-->,
              ]
            `);

        next();
        await find('0 cats');
        expect(childHTML())
            .toMatchInlineSnapshot(`
              [
                "<p>0<!--1--> cats</p>",
                <!--1-->,
                "<ul><!--0--></ul>",
                <!--1-->,
                <!--0-->,
              ]
            `);
    });

    test('all transform/option combos', async ({ fixture, find, expect, childHTML }) => {
        const [cat, next] = subject();

        const Channels = branch(
            cat,
            [null, { start: 'start' }],
            [null, { init: 'init' }],
            [name => 'second', { start: 'first' }],
            [name => name, { start: 'one', init: 'two' }],
            [name => name.toUpperCase(), { init: 'felix' }],
            null,
            name => `${name}!`,
            [name => name[0]],
        );

        expect(Channels.length).toBe(8);
        fixture.append(...Channels.map(C => <C />));

        expect(childHTML()).toMatchInlineSnapshot(`
          [
            start,
            <!--1-->,
            init,
            <!--1-->,
            first,
            <!--1-->,
            one,
            <!--1-->,
            FELIX,
            <!--1-->,
            <!--0-->,
            <!--0-->,
            <!--0-->,
          ]
        `);

        await find('two', { exact: false });
        expect(childHTML()).toMatchInlineSnapshot(`
          [
            start,
            <!--1-->,
            init,
            <!--1-->,
            first,
            <!--1-->,
            two,
            <!--1-->,
            FELIX,
            <!--1-->,
            <!--0-->,
            <!--0-->,
            <!--0-->,
          ]
        `);

        next('duchess');
        await find('DUCHESS', { exact: false });
        expect(childHTML()).toMatchInlineSnapshot(`
          [
            duchess,
            <!--1-->,
            duchess,
            <!--1-->,
            second,
            <!--1-->,
            duchess,
            <!--1-->,
            DUCHESS,
            <!--1-->,
            duchess,
            <!--1-->,
            duchess!,
            <!--1-->,
            d,
            <!--1-->,
          ]
        `);

    });

});