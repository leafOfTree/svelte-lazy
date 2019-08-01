# svelte-lazy

## Install

    npm i svelte-lazy

## Usage

```html
<Lazy height={500} offset={150}>
  <img alt="" src={imgSrc} />
</Lazy>
```

## Options

### Lazy

| Property | Description                                                                                          | Type   | Default Value |
|----------|------------------------------------------------------------------------------------------------------|--------|---------------|
| height   | Height of the placeholder before the component is loaded. Set a proper value to avoid scroll bounce. | number | 0             |
| offset   | Offset to the bottom of viewport that triggers loading when the component is in.                     | number | 150           |
