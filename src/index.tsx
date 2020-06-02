import ReactDOM from "react-dom";
import React from "react";
import { Card, Cascader, message, Button } from "antd";
import { CascaderOptionType } from "antd/lib/cascader";
import axios from "axios";
import path from "path";
import "antd/dist/antd.css";

interface IAppState {
    urls: string[];
    options: CascaderOptionType[];
}

class App extends React.Component<{}, IAppState> {
    constructor(props: never) {
        super(props);
        const urls: string[] = window.location.hash.split("/").slice(1);
        const options = [] as CascaderOptionType[];
        this.state = { urls, options };
        this.loadUrl(urls);
    }
    public async componentDidMount() {
        window.addEventListener("hashchange", () => {
            this.setState({
                urls: window.location.hash.split("/").slice(1)
            });
        })
    }
    public render() {
        return (
            <Card
                title={<Cascader
                    displayRender={(label) => label.join("|")}
                    autoFocus={true}
                    options={this.state.options}
                    value={this.state.urls}
                    loadData={(selectedOptions) => this.loadData(selectedOptions)}
                    onChange={(urls: string[]) => {
                        window.location.hash = "#/" + urls.join('/');
                    }}
                    allowClear={false}
                    style={{width: "100%"}}
                />}
                extra={<span>
                    <Button onClick={() => {
                        this.setState({ options: [] });
                        this.loadUrl(this.state.urls);
                    }}>
                        重置
                    </Button>
                    <Button onClick={() => this.getNext()}>
                        下一页
                    </Button>
                </span>}
                cover={<MediaPlayer src={"/" + this.state.urls.join("/")} getNext={() => this.getNext()} /> }
            />
        );
    }

    private async loadData(selectedOptions: CascaderOptionType[]) {
        const url = selectedOptions.reduce((url, {value}) => url + value + "/", "/");
        const targetOption = selectedOptions[selectedOptions.length - 1];
        targetOption.loading = true;
        try {
            const { data } = await axios.get(url)
            targetOption.children = data;
            targetOption.loading = false;
            this.setState({options: this.state.options});
        } catch (err) {
            message.error(`${err}`);
            targetOption.loading = false;
        }
    }
    private async loadUrl(urls: string[]) {
        let url = "/";
        let { data }: { data: CascaderOptionType[] } = await axios.get(url);
        this.setState({options: data});
        for (const suburl of urls) {
            const idx = data.findIndex(({value, isLeaf}) => value === suburl && !isLeaf);
            if (idx === -1) {
                break;
            }
            url += suburl + "/";
            data[idx].children = (await axios.get(url)).data;
            data = data[idx].children;
        }
        this.setState({options: this.state.options});
    }
    private getNext() {
        let option = this.state.options;
        const urls = this.state.urls;
        for (let url_idx = 0; url_idx < urls.length; url_idx++) {
            const url = urls[url_idx];
            if (url_idx < urls.length - 1) {
                option = option.find(({value}) => value === url).children;
            } else {
                const idx = option.findIndex(({value}) => value === url)
                if (idx+1 === option.length) {
                    message.warn("看完咯");
                    return false;
                } else {
                    urls[url_idx] = option[idx+1].value as string;
                    this.setState({urls});
                    window.location.hash = "#/" + urls.join('/');
                    return true;
                }
            }
        }
    }
}

class MediaPlayer extends React.Component<{src: string, getNext(): boolean}> {
    render() {
        switch(path.extname(this.props.src)) {
            case ".mp4":
                return <video src={this.props.src} autoPlay controls />;
            case ".jpg":
            case ".jpeg":
            default:
                return <img src={this.props.src} onClick={this.props.getNext}/>;
        }
    }
}

ReactDOM.render(
    <App />,
    document.getElementById("root")
);
