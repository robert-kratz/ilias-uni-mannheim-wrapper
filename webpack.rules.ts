import type { ModuleOptions } from 'webpack';

export const rules: Required<ModuleOptions>['rules'] = [
    // Add support for native node modules
    {
        // We're specifying native_modules in the test because the asset relocator loader generates a
        // "fake" .node file which is really a cjs file.
        test: /native_modules[/\\].+\.node$/,
        use: 'node-loader',
    },
    {
        test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
        parser: { amd: false },
        use: {
            loader: '@vercel/webpack-asset-relocator-loader',
            options: {
                outputAssetBase: 'native_modules',
            },
        },
    },
    {
        test: /\.tsx?$/,
        exclude: /(node_modules|\.webpack)/,
        use: {
            loader: 'ts-loader',
            options: {
                transpileOnly: true,
            },
        },
    },
    {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'postcss-loader' }],
    },
    {
        test: /\.svg$/,
        use: ['@svgr/webpack', 'url-loader'], // SVG handled as components and fallback to url
    },
    {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
            {
                loader: 'url-loader',
                options: {
                    limit: 8192, // Inline files smaller than 8kB
                    name: 'assets/[name].[hash:8].[ext]', // File naming format
                },
            },
        ],
    },
];
