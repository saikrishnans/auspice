import React from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import SidebarToggle from "../framework/sidebar-toggle";
import { Frequencies } from "../frequencies";
import { Entropy } from "../entropy";
import Info from "../info/info";
import Tree from "../tree";
import Map from "../map/map";
import { controlsHiddenWidth } from "../../util/globals";
import Footer from "../framework/footer";
import DownloadModal from "../download/downloadModal";
import { analyticsNewPage } from "../../util/googleAnalytics";
import filesDropped from "../../actions/filesDropped";
import AnimationController from "../framework/animationController";
import { calcUsableWidth } from "../../util/computeResponsive";
import { renderNarrativeToggle } from "../narrative/renderNarrativeToggle";
import { Sidebar } from "./sidebar";
import { calcPanelDims, calcStyles } from "./utils";
import { PanelsContainer } from "./styles";

@connect((state) => ({
  panelsToDisplay: state.controls.panelsToDisplay,
  panelLayout: state.controls.panelLayout,
  displayNarrative: state.narrative.display,
  narrativeIsLoaded: state.narrative.loaded,
  narrativeTitle: state.narrative.title,
  browserDimensions: state.browserDimensions.browserDimensions,
  frequenciesLoaded: state.frequencies.loaded
}))
class Main extends React.Component {
  constructor(props) {
    super(props);
    /* window listener to see when width changes cross threshold to toggle sidebar */
    const mql = window.matchMedia(`(min-width: ${controlsHiddenWidth}px)`);
    mql.addListener(() => this.setState({
      sidebarOpen: this.state.mql.matches,
      mobileDisplay: !this.state.mql.matches
    }));
    this.state = {mql, sidebarOpen: mql.matches, mobileDisplay: !mql.matches};
    analyticsNewPage();
  }
  static propTypes = {
    dispatch: PropTypes.func.isRequired
  }
  componentWillReceiveProps(nextProps) {
    if (
      (this.state.mql.matches) ||
      (nextProps.displayNarrative && !this.props.displayNarrative)
    ) {
      this.setState({sidebarOpen: true});
    }
  }
  componentDidMount() {
    document.addEventListener("dragover", (e) => {e.preventDefault();}, false);
    document.addEventListener("drop", (e) => {
      e.preventDefault();
      return this.props.dispatch(filesDropped(e.dataTransfer.files));
    }, false);
  }
  render() {
    const {availableWidth, availableHeight, sidebarWidth, overlayStyles} =
      calcStyles(this.props.browserDimensions, this.props.displayNarrative, this.state.sidebarOpen, this.state.mobileDisplay);
    const overlayHandler = () => {this.setState({sidebarOpen: false});};
    const {big, chart} = calcPanelDims(this.props.panelLayout === "grid", this.props.panelsToDisplay, this.props.displayNarrative, availableWidth, availableHeight);
    return (
      <span>
        <AnimationController/>
        <DownloadModal/>
        <SidebarToggle
          sidebarOpen={this.state.sidebarOpen}
          mobileDisplay={this.state.mobileDisplay}
          handler={() => {this.setState({sidebarOpen: !this.state.sidebarOpen});}}
        />
        <Sidebar
          sidebarOpen={this.state.sidebarOpen}
          width={sidebarWidth}
          height={availableHeight}
          displayNarrative={this.props.displayNarrative}
          panelsToDisplay={this.props.panelsToDisplay}
          narrativeTitle={this.props.narrativeTitle}
          mobileDisplay={this.state.mobileDisplay}
          navBarHandler={() => {this.setState({sidebarOpen: !this.state.sidebarOpen});}}
        />
        <PanelsContainer width={availableWidth} height={availableHeight} left={this.state.sidebarOpen ? sidebarWidth : 0}>
          {this.props.narrativeIsLoaded ? renderNarrativeToggle(this.props.dispatch, this.props.displayNarrative) : null}
          {this.props.displayNarrative ? null : <Info width={calcUsableWidth(availableWidth, 1)} />}
          {this.props.panelsToDisplay.includes("tree") ? <Tree width={big.width} height={big.height} /> : null}
          {this.props.panelsToDisplay.includes("map") ? <Map width={big.width} height={big.height} justGotNewDatasetRenderNewMap={false} /> : null}
          {this.props.panelsToDisplay.includes("entropy") ? <Entropy width={chart.width} height={chart.height} /> : null}
          {this.props.panelsToDisplay.includes("frequencies") && this.props.frequenciesLoaded ? <Frequencies width={chart.width} height={chart.height} /> : null}
          {this.props.displayNarrative ? null : <Footer width={calcUsableWidth(availableWidth, 1)} />}
        </PanelsContainer>
        {/* overlay (used for mobile to open / close sidebar) */}
        {this.state.mobileDisplay ?
          <div style={overlayStyles} onClick={overlayHandler} onTouchStart={overlayHandler}/> :
          null
        }
      </span>
    );
  }
}

export default Main;
